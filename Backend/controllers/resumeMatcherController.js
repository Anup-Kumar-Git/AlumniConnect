const User = require('../models/User');
const pdfParse = require('pdf-parse');
const Request = require('../models/Request');

// A large predefined list of skills and domains to look for
const predefinedSkills = [
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'go', 'rust',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express', 'django', 'flask',
  'spring', 'laravel', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux', 'git', 'ci/cd', 'agile',
  'machine learning', 'data science', 'ai', 'deep learning', 'nlp', 'cybersecurity',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'typescript', 'figma', 'ui/ux',
  'product management', 'product strategy', 'marketing', 'sales', 'business analysis',
  'rest api', 'graphql', 'system design', 'microservices', 'cloud computing', 'android', 'ios',
  'fintech', 'edtech', 'healthtech', 'blockchain', 'web3', 'cryptocurrency'
];

exports.getRecommendations = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    let extractedSkills = [];
    
    // Parse the PDF resume if it exists
    if (student.resume && student.resume.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = student.resume.split(',')[1];
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        const pdfData = await pdfParse(pdfBuffer);
        
        const resumeText = pdfData.text.toLowerCase();
        
        // Find predefined skills appearing in the resume
        extractedSkills = predefinedSkills.filter(skill => resumeText.includes(skill));
      } catch (parseErr) {
        console.error('Error parsing PDF:', parseErr);
        // Non-breaking fallback 
      }
    } 

    if (extractedSkills.length === 0) {
      // Fallback: If no resume or parse failed, use student's domain and interested subjects text.
      const fallbackText = `${student.domain || ''} ${student.interestedSubject || ''} ${student.otherDetails || ''}`.toLowerCase();
      extractedSkills = predefinedSkills.filter(skill => fallbackText.includes(skill));
    }
    
    // Fetch all verified Alumni from the system
    const alumniList = await User.find({ role: 'Alumni', isVerified: true }).select('-password -resume');
    
    // Fetch existing requests to see if student already requested these alumni
    const studentRequests = await Request.find({ student: req.user.id });
    const requestMap = {};
    studentRequests.forEach(r => requestMap[r.alumni.toString()] = r.status);
    
    // Score each Alumni's expertise against the extracted skills
    const scoredAlumni = alumniList.map(alumni => {
      let score = 0;
      const alumniText = `${alumni.expertise || ''} ${alumni.domain || ''} ${alumni.otherDetails || ''} ${alumni.company || ''} ${alumni.interestedSubject || ''}`.toLowerCase();
      
      const matchedSkills = [];
      extractedSkills.forEach(skill => {
        if (alumniText.includes(skill)) {
          score += 1; // Increase score for every overlapping skill
          matchedSkills.push(skill);
        }
      });
      
      return {
        _id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        company: alumni.company,
        expertise: alumni.expertise,
        domain: alumni.domain,
        profilePicture: alumni.profilePicture,
        academicYear: alumni.academicYear,
        score,
        matchedSkills,
        requestStatus: requestMap[alumni._id.toString()] || null
      };
    });
    
    // Sort descending by score, only keep those with > 0 score, limit to top 4 recommendations
    const recommendations = scoredAlumni
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
      
    // Send both the recommendations and the skills we extracted for transparency
    res.json({
      extractedSkills,
      recommendations
    });
  } catch (err) {
    console.error('Recommendation Engine Error:', err);
    res.status(500).json({ msg: 'Server Error in AI Matcher' });
  }
};
