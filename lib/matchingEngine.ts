/**
 * Engine for calculating the compatibility match score between a candidate and a job.
 * Returns a score between 0 and 100.
 */

export interface CandidateMatchProfile {
  tags: string[];
  professionalTitle: string;
  location: string;
  experienceLevel?: string;
  industryInterests?: string[];
}

export interface JobMatchProfile {
  tags: string[];
  title: string;
  location: string;
  modality: string;
  description?: string;
  requirements?: string;
  experienceLevel?: string;
}

export function calculateMatchScore(
  candidate: CandidateMatchProfile,
  job: JobMatchProfile
): number {
  let score = 0;

  // 1. Tag & Skill Matching (Max 45 points)
  const candTags = (candidate.tags || []).map(t => t.toLowerCase().trim()).filter(Boolean);
  const jobTags = (job.tags || []).map(t => t.toLowerCase().trim()).filter(Boolean);

  if (jobTags.length > 0) {
    let matches = 0;
    jobTags.forEach(jt => {
      if (candTags.some(ct => ct === jt || ct.includes(jt) || jt.includes(ct))) {
        matches++;
      }
    });
    const tagRatio = matches / jobTags.length;
    score += Math.round(tagRatio * 45);
  } else {
    // If job has no tags, check if candidate tags exist in description/requirements
    let matches = 0;
    const textToSearch = `${job.title} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    
    candTags.forEach(ct => {
      if (textToSearch.includes(ct)) {
        matches++;
      }
    });
    
    // Add 10 points per matched skill keyword, up to 45
    score += Math.min(45, matches * 10);
  }

  // 2. Title & Role Matching (Max 25 points)
  const candTitle = (candidate.professionalTitle || '').toLowerCase().trim();
  const jobTitle = (job.title || '').toLowerCase().trim();

  if (candTitle && jobTitle) {
    if (candTitle === jobTitle || candTitle.includes(jobTitle) || jobTitle.includes(candTitle)) {
      score += 25;
    } else {
      // Split into words and check common keywords (excluding common short words / stop words)
      const stopWords = new Set(['de', 'en', 'y', 'la', 'el', 'los', 'las', 'para', 'con', 'del', 'un', 'una', 'a', 'o', 'u']);
      const candWords = candTitle.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
      const jobWords = jobTitle.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
      
      let commonWords = 0;
      jobWords.forEach(jw => {
        if (candWords.some(cw => cw === jw || cw.includes(jw) || jw.includes(cw))) {
          commonWords++;
        }
      });

      if (commonWords > 0) {
        // Partial match points based on word overlap
        score += Math.min(20, commonWords * 10);
      } else {
        // Category check fallback using industry interests if available
        const candIndustries = (candidate.industryInterests || []).map(i => i.toLowerCase());
        const jobDesc = `${job.title} ${job.description || ''}`.toLowerCase();
        
        let industryMatch = false;
        candIndustries.forEach(ind => {
          if (jobDesc.includes(ind)) {
            industryMatch = true;
          }
        });
        
        if (industryMatch) {
          score += 10;
        }
      }
    }
  }

  // 3. Modality & Location Matching (Max 20 points)
  const candLoc = (candidate.location || '').toLowerCase().trim();
  const jobLoc = (job.location || '').toLowerCase().trim();
  const jobMod = (job.modality || '').toLowerCase().trim();

  const isRemoteJob = jobMod.includes('remot') || jobMod.includes('home');
  const isCandidateRemotePreferred = candTags.includes('remoto') || candTags.includes('home office') || candTags.includes('híbrido') || candTags.includes('hibrido');

  if (isRemoteJob) {
    // Remote works from anywhere
    if (isCandidateRemotePreferred) {
      score += 20; // Perfect match
    } else {
      score += 15; // Still highly compatible
    }
  } else {
    // Presencial/Híbrido needs location alignment
    if (candLoc && jobLoc) {
      const cityCand = candLoc.split(',')[0].trim();
      const cityJob = jobLoc.split(',')[0].trim();
      
      if (cityCand === cityJob || candLoc.includes(cityJob) || jobLoc.includes(cityCand)) {
        score += 20; // Same city!
      } else {
        // Check country or region
        const countryCand = candLoc.split(',')[1]?.trim();
        const countryJob = jobLoc.split(',')[1]?.trim();
        
        if (countryCand && countryJob && countryCand === countryJob) {
          score += 10; // Same country, different city
        } else {
          // Check if candidate is willing to relocate or open to other cities
          if (candTags.includes('relocación') || candTags.includes('viajar') || candTags.includes('disponibilidad para viajar')) {
            score += 8;
          }
        }
      }
    } else {
      score += 10; // Neutral fallback if location is missing
    }
  }

  // 4. Experience Level Matching (Max 10 points)
  const candExp = (candidate.experienceLevel || '').toLowerCase().trim();
  const jobReqText = `${job.title} ${job.requirements || ''} ${job.description || ''}`.toLowerCase();

  if (candExp) {
    if (candExp.includes('senior') || candExp.includes('avanzado') || candExp.includes('sr')) {
      if (jobReqText.includes('senior') || jobReqText.includes('sr') || jobReqText.includes('lider') || jobReqText.includes('líder') || jobReqText.includes('años de experiencia') || jobReqText.includes('experto')) {
        score += 10;
      } else {
        score += 6; // Overqualified, but still matching
      }
    } else if (candExp.includes('junior') || candExp.includes('jr') || candExp.includes('principiante') || candExp.includes('sin experiencia')) {
      if (jobReqText.includes('junior') || jobReqText.includes('jr') || jobReqText.includes('sin experiencia') || jobReqText.includes('práctica') || jobReqText.includes('practicante')) {
        score += 10;
      } else if (jobReqText.includes('senior') || jobReqText.includes('sr') || jobReqText.includes('avanzado') || jobReqText.includes('lider')) {
        score += 2; // High requirements for junior
      } else {
        score += 8; // Normal intermediate job
      }
    } else {
      // Intermediate / default
      if (jobReqText.includes('senior') || jobReqText.includes('sr')) {
        score += 6;
      } else {
        score += 10;
      }
    }
  } else {
    score += 8; // Default fallback points if candidate exp not filled
  }

  // Bound score between 0 and 100
  return Math.max(0, Math.min(100, score));
}
