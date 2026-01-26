import httpx
from typing import List, Dict, Optional, Any
from src.config import settings

class TutorlyClient:
    """
    Handles all raw HTTP communication with the Tutorly Backend.
    """
    def __init__(self):
        self.base_url = settings.API_BASE_URL
        self.headers = {"Content-Type": "application/json"}
        # You can add Authorization headers here later if needed

    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Generic GET helper with error handling."""
        async with httpx.AsyncClient(timeout=settings.API_TIMEOUT) as client:
            try:
                # Filter out None values from params to keep URL clean
                clean_params = {k: v for k, v in params.items() if v is not None} if params else {}
                
                response = await client.get(
                    f"{self.base_url}{endpoint}", 
                    params=clean_params,
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                return {"error": f"HTTP Error {e.response.status_code}: {e.response.text}"}
            except Exception as e:
                return {"error": f"Connection Error: {str(e)}"}

    async def get_all_subjects(self) -> List[Dict]:
        """Fetches list of subjects."""
        return await self._get("/individual-tutor/subjects")

    async def get_titles_by_subject(self, subject_id: str) -> List[Dict]:
        """Fetches sub-topics (titles) for a specific subject ID."""
        return await self._get(f"/individual-tutor/titles/{subject_id}")

    async def search_individual_tutors(self, filters: Dict) -> List[Dict]:
        """Searches for 1-on-1 tutors."""
        return await self._get("/student/getAllIndividualTutors", params=filters)

    async def search_mass_classes(self, filters: Dict) -> List[Dict]:
        """Searches for Mass Classes."""
        return await self._get("/student/getAllMassClasses", params=filters)

# Create a singleton instance to be used by tools
api = TutorlyClient()