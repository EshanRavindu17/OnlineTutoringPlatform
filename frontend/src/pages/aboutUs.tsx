import React from 'react';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  Code, 
  Palette, 
  Database,
  Brain,
  Star,
  BookOpen,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Github,
  Linkedin,
  Mail,
  Cpu,
  Network,
  Layers,
  Binary,
  Hexagon,
  Triangle,
  Square,
  Circle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import pamoj from '../assets/pamoj.jpg';
import eshan from '../assets/eshan.jpg';
import gayashan from '../assets/gayashan.jpg'

const AboutUs: React.FC = () => {
  // Add custom styles for animations
  const customStyles = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 4s linear infinite;
    }
  `;

  const teamMembers = [
    {
      name: "Gayashan De Silva",
      role: "Chief Technology Officer & Co-Founder",
      specialization: "Full-Stack Development & System Architecture",
      description: "Visionary technologist leading our company's innovation with expertise in modern web technologies and scalable system design.",
      image: gayashan,
      skills: ["React", "Node.js", "TypeScript", "System Design"],
      social: {
        github: "https://github.com/GayashanKavishka",
        linkedin: "https://www.linkedin.com/in/gayashan-de-silva-a168a22a7/",
        email: "kavishka.22@cse.mrt.ac.lk"
      }
    },
    {
      name: "Pamoj Silva",
      role: "Lead UI/UX Designer & Co-Founder",
      specialization: "User Experience & Interface Design",
      description: "Creative mastermind crafting intuitive and beautiful user experiences that make digital solutions accessible and engaging for everyone.",
      image : pamoj,
      skills: ["UI/UX Design", "Figma", "User Research", "Prototyping"],
      social: {
        github: "https://github.com/PamojX",
        linkedin: "https://linkedin.com/in/pamoj-hansindu-447751292",
        email: "pamoj.22@cse.mrt.ac.lk"
      }
    },
    {
      name: "Eshan Deepthika",
      role: "Backend Lead & Co-Founder",
      specialization: "Database Architecture & API Development",
      description: "Backend virtuoso ensuring our applications run smoothly with robust database design and high-performance API architecture.",
      image: eshan,
      skills: ["Database Design", "API Development", "Cloud Architecture", "Security"],
      social: {
        github: "https://github.com/EshanRavindu17",
        linkedin: "https://www.linkedin.com/in/eshan-ravindu-a56978299/",
        email: "eshan.22@cse.mrt.ac.lk"
      }
    }
  ];

  const companyValues = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Innovation First",
      description: "We constantly push the boundaries of technology to create groundbreaking digital solutions and experiences."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Client-Centric",
      description: "Every decision we make is driven by our commitment to empowering clients and delivering exceptional value."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "We maintain the highest standards in technology, development, and user experience across all our projects."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Delivering cutting-edge solutions to clients worldwide, breaking geographical and technological barriers."
    }
  ];

  const achievements = [
    { number: "50+", label: "Projects Delivered", icon: <Users className="w-6 h-6" /> },
    { number: "100+", label: "Satisfied Clients", icon: <Award className="w-6 h-6" /> },
    { number: "25+", label: "Technologies Mastered", icon: <BookOpen className="w-6 h-6" /> },
    { number: "99%", label: "Success Rate", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Add custom styles */}
      <style>{customStyles}</style>
      
      <Navbar />
      
      {/* Logo Section */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 shadow-lg border-b-4 border-blue-500">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            {/* Creative PKD Logo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {/* Logo Background Circle with Enhanced Colors */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110">
                  <div className="w-20 h-20 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                      PKD
                    </span>
                  </div>
                </div>
                
                {/* Enhanced Floating Tech Elements */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce shadow-lg flex items-center justify-center">
                  <Code className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -top-1 -left-4 w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute -bottom-3 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-lg"></div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              </div>
              
              {/* Company Name with Enhanced Styling */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-black text-gray-800 mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PKD</span>
                  <span className="text-gray-700 ml-2">Pvt LTD</span>
                </h1>
                <p className="text-xl text-gray-600 font-bold mb-4">
                  To Make Your Life Easier 
                </p>
                
                {/* Additional Tech Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    Innovation Hub
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    Tech Leaders
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    Future Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Tech Company Banner */}
      <div className="relative overflow-hidden py-12">
        {/* Tech Team Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop&crop=faces)'
          }}
        ></div>
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 opacity-85"></div>
        
        {/* Secondary Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-pulse">
            <Hexagon className="w-16 h-16 text-blue-400" />
          </div>
          <div className="absolute top-20 right-20 animate-bounce">
            <Triangle className="w-12 h-12 text-purple-400" />
          </div>
          <div className="absolute bottom-20 left-20 animate-spin-slow">
            <Square className="w-14 h-14 text-green-400" />
          </div>
          <div className="absolute bottom-10 right-10 animate-pulse">
            <Circle className="w-18 h-18 text-yellow-400" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-bounce">
            <Binary className="w-20 h-20 text-cyan-400" />
          </div>
          <div className="absolute top-1/3 right-1/3 animate-pulse">
            <Network className="w-16 h-16 text-pink-400" />
          </div>
        </div>

        {/* Tech Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-blue-400"></div>
            ))}
          </div>
        </div>

        {/* Floating Code Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 left-1/4 text-blue-300 opacity-20 font-mono text-sm animate-pulse">
            {'{ "innovation": true }'}
          </div>
          <div className="absolute bottom-16 right-1/4 text-purple-300 opacity-20 font-mono text-sm animate-pulse">
            {'<education />'}
          </div>
          <div className="absolute top-1/2 left-1/6 text-green-300 opacity-20 font-mono text-sm animate-pulse">
            {'const future = () => learning;'}
          </div>
          <div className="absolute top-1/3 right-1/6 text-yellow-300 opacity-20 font-mono text-sm animate-pulse">
            {'npm install success'}
          </div>
        </div>

        {/* Main Banner Content */}
        <div className="relative container mx-auto px-4 text-center z-10">
          <div className="max-w-7xl mx-auto">

            {/* Tech Icons Row */}
            <div className="flex justify-center items-center space-x-6 mb-8">
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                <Cpu className="w-8 h-8 text-blue-300" />
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                <Code className="w-8 h-8 text-purple-300" />
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                <Database className="w-8 h-8 text-green-300" />
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                <Network className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm border border-white border-opacity-20">
                <Layers className="w-8 h-8 text-pink-300" />
              </div>
            </div>

            {/* Banner Title */}
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TECH
              </span>
              <br />
              <span className="text-white">INNOVATORS</span>
            </h2>

            {/* Banner Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
              Where cutting-edge technology meets business excellence. 
              We code the future of digital solutions, one innovation at a time.
            </p>

            {/* Tech Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg">
                <div className="text-2xl font-bold text-blue-300">100%</div>
                <div className="text-blue-100 text-sm">Cloud Native</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg">
                <div className="text-2xl font-bold text-purple-300">24/7</div>
                <div className="text-purple-100 text-sm">Uptime</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg">
                <div className="text-2xl font-bold text-green-300">AI</div>
                <div className="text-green-100 text-sm">Powered</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg">
                <div className="text-2xl font-bold text-yellow-300">∞</div>
                <div className="text-yellow-100 text-sm">Scalability</div>
              </div>
            </div>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-blue-200 font-semibold border border-white border-opacity-20">
                React.js
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-green-200 font-semibold border border-white border-opacity-20">
                Node.js
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-purple-200 font-semibold border border-white border-opacity-20">
                TypeScript
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-yellow-200 font-semibold border border-white border-opacity-20">
                Prisma
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-pink-200 font-semibold border border-white border-opacity-20">
                Firebase
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-15 backdrop-blur-sm rounded-full text-indigo-200 font-semibold border border-white border-opacity-20">
                Docker
              </span>
            </div>
          </div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 bg-opacity-10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-500 bg-opacity-10 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
              <Target className="w-10 h-10 text-blue-600 mr-4" />
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At PKD Pvt LTD, we're on a mission to democratize quality technology solutions through cutting-edge innovation. 
              We believe that every business deserves access to world-class software development, regardless of their size or industry.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our company bridges the gap between complex technology and practical business solutions, creating meaningful 
              digital experiences that drive growth and operational excellence.
            </p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                To become the world's most trusted and innovative technology solutions provider, 
                empowering businesses to achieve their digital transformation goals and unlock their full potential.
              </p>
              <div className="mt-6 flex space-x-4">
                <Zap className="w-8 h-8 text-yellow-300" />
                <Globe className="w-8 h-8 text-green-300" />
                <Star className="w-8 h-8 text-orange-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {achievement.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{achievement.number}</div>
                  <div className="text-gray-600 font-medium">{achievement.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Core Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-blue-600 mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Meet Our Founding Team</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Three passionate technologists united by a shared vision to revolutionize digital solutions through innovation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <div className="relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-100 object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-all duration-300"></div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-purple-600 font-medium mb-4">{member.specialization}</p>
                  <p className="text-gray-600 leading-relaxed mb-6">{member.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Core Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <a href={member.social.github} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Technology Excellence</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
            <Code className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Frontend Innovation</h3>
            <p className="text-gray-600 leading-relaxed">
              Cutting-edge React, TypeScript, and modern web technologies creating seamless user experiences
            </p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl">
            <Database className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Backend Mastery</h3>
            <p className="text-gray-600 leading-relaxed">
              Robust Node.js architecture with Prisma ORM and secure authentication systems
            </p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-green-50 to-teal-100 rounded-2xl">
            <Palette className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Design Excellence</h3>
            <p className="text-gray-600 leading-relaxed">
              Beautiful, intuitive interfaces designed with user experience at the forefront
            </p>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Ready to start your digital transformation journey or have questions about PKD Pvt LTD? 
              We'd love to hear from you and help you achieve your business goals.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Mail className="w-8 h-8 text-blue-600 mr-3" />
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-1">General Inquiries</h4>
                      <p className="text-gray-600">info@pkdpvtltd.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-1">Client Support</h4>
                      <p className="text-gray-600">support@pkdpvtltd.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-1">Business Partnerships</h4>
                      <p className="text-gray-600">partnerships@pkdpvtltd.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Code className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-1">Technical Support</h4>
                      <p className="text-gray-600">tech@pkdpvtltd.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="p-4 bg-blue-100 rounded-full hover:bg-blue-200 transition-all duration-300 group">
                    <Linkedin className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                  </a>
                  <a href="#" className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300 group">
                    <Github className="w-6 h-6 text-gray-600 group-hover:text-gray-700" />
                  </a>
                  <a href="mailto:info@pkdpvtltd.com" className="p-4 bg-red-100 rounded-full hover:bg-red-200 transition-all duration-300 group">
                    <Mail className="w-6 h-6 text-red-600 group-hover:text-red-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300">
                    <option value="" className="text-gray-600">Select a subject</option>
                    <option value="general" className="text-gray-800">General Inquiry</option>
                    <option value="client" className="text-gray-800">Client Support</option>
                    <option value="partnership" className="text-gray-800">Business Partnership</option>
                    <option value="technical" className="text-gray-800">Technical Issue</option>
                    <option value="project" className="text-gray-800">Project Consultation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg transform"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-xl max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Office Hours</h3>
              <div className="grid md:grid-cols-3 gap-6 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Client Support</h4>
                  <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                  <p>Saturday: 10:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Support</h4>
                  <p>24/7 Online Support</p>
                  <p>Emergency: Available anytime</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Business Inquiries</h4>
                  <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p>Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;