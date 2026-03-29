from mcp.server.fastmcp import FastMCP
from src.server.api_client import api

# Initialize the MCP Server
mcp = FastMCP("Tutorly Service")

@mcp.tool()
async def get_available_subjects() -> str:
    """
    Returns a list of all main subjects available on the platform.
    Use this to verify subject names before searching.
    """
    data = await api.get_all_subjects()
    
    if isinstance(data, dict) and "error" in data:
        return f"System Error: {data['error']}"
        
    # Format as a clean list for the LLM
    names = [sub.get('name', 'Unknown') for sub in data]
    return f"Available Subjects: {', '.join(names)}"

@mcp.tool()
async def get_subject_topics(subject_name: str) -> str:
    """
    Gets specific sub-topics (titles) for a given Subject Name.
    Example: Input 'Mathematics' -> Returns 'Algebra, Calculus, Geometry'.
    """
    # 1. Fetch all subjects to find the ID
    all_subjects = await api.get_all_subjects()
    
    # Logic: Case-insensitive search for the ID
    subject_id = None
    for sub in all_subjects:
        if sub.get('name', '').lower() == subject_name.lower():
            subject_id = sub.get('sub_id')
            break
            
    if not subject_id:
        return f"Error: Subject '{subject_name}' not found. Please ask user to clarify."

    # 2. Fetch titles using the ID
    titles = await api.get_titles_by_subject(subject_id)
    
    if isinstance(titles, dict) and "error" in titles:
        return f"Error: {titles['error']}"
        
    names = [t.get('name') for t in titles]
    if not names:
        return f"No specific sub-topics found for {subject_name}."
        
    return f"Topics for {subject_name}: {', '.join(names)}"

@mcp.tool()
async def find_individual_tutors(
    subject: str = None,
    title: str = None,
    max_price: int = None,
    sort_by: str = "rating_desc"
) -> str:
    """
    Finds individual 1-on-1 tutors based on filters.
    
    Args:
        subject: Main subject name (e.g. 'Mathematics').
        title: Specific sub-topic (e.g. 'Algebra').
        max_price: Maximum hourly rate in LKR.
        sort_by: Sorting preference ('price_asc', 'price_desc', 'rating_desc').
    """
    # Map AI arguments to Backend Query Params
    filters = {
        "page": 1,
        "limit": 5, # Keep it small for the chat context
        "sort": sort_by
    }
    if subject: filters["subjects"] = subject
    if title: filters["titles"] = title
    if max_price: filters["max_hourly_rate"] = max_price

    results = await api.search_individual_tutors(filters)
    
    if isinstance(results, dict) and "error" in results:
        return f"Search Error: {results['error']}"
    if not results:
        return "No tutors found matching your criteria."

    # Format the output beautifully for the AI
    output = []
    for t in results:
        user = t.get("User", {})
        subjects_str = ", ".join(t.get("subjects", []))
        topics_str = ", ".join(t.get("titles", []))
        output.append(
            f"👤 Name: {user.get('name', 'Unknown')}\n"
            f"   - Tutor ID: {t.get('i_tutor_id', '')}\n"           # Must give ID to LLM
            f"   - Image URL: {user.get('photo_url', '')}\n"        # Must give Image to LLM
            f"   - Subjects: {subjects_str}\n"                      # Must give Subjects
            f"   - Topics: {topics_str}\n"                          # Must give Topics
            f"   - Rate: {t.get('hourly_rate')} LKR/hr\n"
            f"   - Rating: {t.get('rating')} Stars\n"
        )
    
    return "\n".join(output)

@mcp.tool()
async def find_mass_classes(
    subject: str = None,
    tutor_name: str = None,
    max_monthly_fee: int = None
) -> str:
    """
    Finds group/mass classes.
    """
    filters = {
        "page": 1, 
        "limit": 5, 
        "sort": "rating_desc"
    }
    if subject: filters["subjects"] = subject
    if tutor_name: filters["searchTerm"] = tutor_name
    if max_monthly_fee: filters["maxMonthRate"] = max_monthly_fee

    results = await api.search_mass_classes(filters)

    if isinstance(results, dict) and "error" in results:
        return f"Error: {results['error']}"
    if not results:
        return "No mass classes found."

    output = []
    for c in results:
        
        mass_tutor = c.get("Mass_Tutor", {})
        user = mass_tutor.get("User", {})
        name = user.get("name", "Unknown")
        photo_url = user.get("photo_url", "")
        price = mass_tutor.get("prices", "N/A")
        rating = mass_tutor.get("rating", "N/A")
        class_id = c.get("class_id", "")

        output.append(
            f"🎓 Class: {c.get('title')}\n"
            f"    Class_ID: {class_id}\n"
            f"   - Tutor: {name}\n"
            f"   - Image: {photo_url}\n"
            f"   - Rating: {rating} Stars\n"
            f"   - Price: {price} LKR/month\n"
        )
        
    return "\n".join(output)