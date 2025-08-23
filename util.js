const maskdata = require('maskdata');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

let POML;
try {
    POML = require('pomljs');
} catch (error) {
    console.warn('POML parser not available, using fallback text processing');
}
    
require("dotenv").config();

function maskContent(contentType) {    
    if (contentType == "resume") {
        let originalResume = require("./original/inputresume.json");
        return maskResume(originalResume)
    } else if (contentType == "linkedin") {
        let originalLinkedIn = require("./original/inputlinkedin.json");
        return maskLinkedIn(originalLinkedIn)
    } else if (contentType == "github") {
        let originalGithub = require("./original/inputgithub.json");
        return maskGithub(originalGithub)
    } else if (contentType == "portfolio") {
        const originalPortfolio = require("./original/inputportfolio.json");
        return maskPortfolio(originalPortfolio)
    }
}

function maskResume(originalResume) {
    const maskedResume = JSON.parse(JSON.stringify(originalResume));

    if (maskedResume.basics) {
        if (maskedResume.basics.name) {
            maskedResume.basics.name = maskdata.maskStringV2(maskedResume.basics.name, {
                maskWith: '*',
                unmaskedStartCharacters: 1,
                unmaskedEndCharacters: 1,
                maxMaskedCharacters: 15
            });
        }

        if (maskedResume.basics.email) {
            maskedResume.basics.email = maskdata.maskEmail2(maskedResume.basics.email, {
                maskWith: '*',
                unmaskedStartCharacters: 2,
                unmaskedEndCharacters: 2,
                maxMaskedCharacters: 5
            });
        }
        
        if (maskedResume.basics.phone) {
            maskedResume.basics.phone = maskdata.maskPhone(maskedResume.basics.phone, {
                maskWith: '*',
                unmaskedStartDigits: 2,
                unmaskedEndDigits: 2
            });
        }
    }

    return {
        maskedData: maskedResume,
        originalData: originalResume
    };
}

function maskLinkedIn(originalLinkedIn) {
    const maskedLinkedIn = JSON.parse(JSON.stringify(originalLinkedIn));

    if (maskedLinkedIn.basics) {
        if (maskedLinkedIn.basics.name) {
            maskedLinkedIn.basics.name = maskdata.maskStringV2(maskedLinkedIn.basics.name, {
                maskWith: '*',
                unmaskedStartCharacters: 1,
                unmaskedEndCharacters: 1,
                maxMaskedCharacters: 15
            });
        }

        if (maskedLinkedIn.basics.email) {
            maskedLinkedIn.basics.email = maskdata.maskEmail2(maskedLinkedIn.basics.email, {
                maskWith: '*',
                unmaskedStartCharacters: 2,
                unmaskedEndCharacters: 2,
                maxMaskedCharacters: 5
            });
        }
        
        if (maskedLinkedIn.basics.phone) {
            maskedLinkedIn.basics.phone = maskdata.maskPhone(maskedLinkedIn.basics.phone, {
                maskWith: '*',
                unmaskedStartDigits: 2,
                unmaskedEndDigits: 2
            });
        }
    }

    return {
        maskedData: maskedLinkedIn,
        originalData: originalLinkedIn
    };
}

function maskGithub(originalGithub) {
    const maskedGithub = JSON.parse(JSON.stringify(originalGithub));

    if (maskedGithub.basics) {
        if (maskedGithub.basics.name) {
            maskedGithub.basics.name = maskdata.maskStringV2(maskedGithub.basics.name, {
                maskWith: '!',
                unmaskedStartCharacters: 1,
                unmaskedEndCharacters: 1,
                maxMaskedCharacters: 10
            });
        }

        if (maskedGithub.basics.email) {
            maskedGithub.basics.email = maskdata.maskEmail2(maskedGithub.basics.email, {
                maskWith: '$',
                unmaskedStartCharacters: 2,
                unmaskedEndCharacters: 2,
                maxMaskedCharacters: 4
            });
        }

        if (maskedGithub.basics.phone) {
            maskedGithub.basics.phone = maskdata.maskPhone(maskedGithub.basics.phone, {
                maskWith: '*',
                unmaskedStartDigits: 2,
                unmaskedEndDigits: 2
            });
        }
    }

    return {
        maskedData: maskedGithub,
        originalData: originalGithub
    };
}

function maskPortfolio(originalPortfolio) {
    const maskedPortfolio = JSON.parse(JSON.stringify(originalPortfolio));

    if (maskedPortfolio.basics) {
        if (maskedPortfolio.basics.name) {
            maskedPortfolio.basics.name = maskdata.maskStringV2(maskedPortfolio.basics.name, {
                maskWith: '*',
                unmaskedStartCharacters: 1,
                unmaskedEndCharacters: 1,
                maxMaskedCharacters: 15
            });
        }

        if (maskedPortfolio.basics.email) {
            maskedPortfolio.basics.email = maskdata.maskEmail2(maskedPortfolio.basics.email, {
                maskWith: '*',
                unmaskedStartCharacters: 2,
                unmaskedEndCharacters: 2,
                maxMaskedCharacters: 5
            });
        }
        
        if (maskedPortfolio.basics.phone) {
            maskedPortfolio.basics.phone = maskdata.maskPhone(maskedPortfolio.basics.phone, {
                maskWith: '*',
                unmaskedStartDigits: 2,
                unmaskedEndDigits: 2
            });
        }
    }

    return {
        maskedData: maskedPortfolio,
        originalData: originalPortfolio
    };
}

function loadPomlFile(filePath) {
    try {
        const fullPath = path.resolve(filePath);
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`POML file not found: ${fullPath}`);
        }

        const pomlContent = fs.readFileSync(fullPath, 'utf8');
        
        if (POML && typeof POML.parse === 'function') {
            try {
                const parsed = POML.parse(pomlContent);
                return convertPomlToPrompt(parsed);
            } catch (parseError) {
                console.warn(`POML parsing failed for ${filePath}, using fallback processing:`, parseError.message);
                return processPomlAsFallback(pomlContent);
            }
        } else {
            return processPomlAsFallback(pomlContent);
        }
    } catch (error) {
        console.error(`Error loading POML file ${filePath}:`, error.message);
        throw error;
    }
}

function processPomlAsFallback(pomlContent) {
    let processedContent = pomlContent;
    processedContent = processedContent.replace(/<\/?poml>/g, '');
    processedContent = processedContent.replace(/<role>(.*?)<\/role>/gs, 'ROLE:\n$1\n\n');
    processedContent = processedContent.replace(/<task>(.*?)<\/task>/gs, 'TASK:\n$1\n\n');
    processedContent = processedContent.replace(/<outputFormat>(.*?)<\/outputFormat>/gs, 'OUTPUT FORMAT:\n$1\n\n');
    processedContent = processedContent.replace(/<cp caption="([^"]*)">(.*?)<\/cp>/gs, '$1:\n$2\n\n');
    processedContent = processedContent.replace(/<list>(.*?)<\/list>/gs, '$1');
    processedContent = processedContent.replace(/<item>(.*?)<\/item>/gs, '- $1');
    processedContent = processedContent.replace(/<code lang="json">(.*?)<\/code>/gs, '```json\n$1\n```');
    processedContent = processedContent.replace(/<obj data="\{resume_data\}" syntax="json"\/>/g, 'DATA: {resume_data}');
    processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return processedContent.trim();
}

function convertPomlToPrompt(parsedPoml) {
    if (typeof parsedPoml === 'string') {
        return parsedPoml;
    } else if (parsedPoml && typeof parsedPoml.toString === 'function') {
        return parsedPoml.toString();
    } else {
        return JSON.stringify(parsedPoml, null, 2);
    }
}

function loadSystemPrompt(contentType) {
    try {
        if (contentType === "resume" || contentType === "linkedin" || contentType === "portfolio") {
            return loadPomlFile("util/systemprompt/normalprompt.poml");
        } else if (contentType === "github") {
            return loadPomlFile("util/systemprompt/githubprompt.poml");
        }
    } catch (error) {
        console.error(`Error loading system prompt for ${contentType}:`, error.message);
        return "You are a helpful assistant."; // fallback
    }
}

function loadUserPrompt(contentType) {
    try {
        return loadPomlFile(`util/userprompt/${contentType}.poml`);
    } catch (error) {
        console.error(`Error loading user prompt for ${contentType}:`, error.message);
        return "Please help me with this task."; // fallback
    }
}

function replacePlaceholders(promptContent, resumeData) {
    return promptContent.replace(/\{resume_data\}/g, JSON.stringify(resumeData, null, 2));
}

async function generateWithGroq(maskedResumeData, contentType) {
    try {
        const systemPrompt = loadSystemPrompt(contentType);
        const userPromptTemplate = loadUserPrompt(contentType);
        
        const userPrompt = replacePlaceholders(userPromptTemplate, maskedResumeData);

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            temperature: contentType === "github" ? 0.3 : 1,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });
        
        let responseContent = completion.choices[0]?.message?.content;
        return responseContent;

    } catch (error) {
        throw new Error(`Error generating ${contentType}: ${error.message}`);
    }
}

function unmaskResume(originalResume, maskedResume) {
    let maskedObj;
    try {
        maskedObj = typeof maskedResume === 'string' ? JSON.parse(maskedResume) : {...maskedResume};
    } catch (e) {
        return maskedResume;
    }

    if (originalResume.basics && maskedObj.basics) {
        if (originalResume.basics.name) maskedObj.basics.name = originalResume.basics.name;
        if (originalResume.basics.email) maskedObj.basics.email = originalResume.basics.email;
        if (originalResume.basics.phone) maskedObj.basics.phone = originalResume.basics.phone;
    }
    
    return maskedObj; 
}

function unmaskLinkedIn(originalResume, maskedLinkedIn) {
    let maskedObj;
    try {
        maskedObj = typeof maskedLinkedIn === 'string'
            ? JSON.parse(maskedLinkedIn)
            : { ...maskedLinkedIn };
    } catch (e) {
        return maskedLinkedIn;
    }

    if (originalResume.basics?.name) {
        const [first, ...lastParts] = originalResume.basics.name.split(" ");
        maskedObj.First_name = first || "";
        maskedObj.Last_name = lastParts.join(" ") || "";
    }
    if (originalResume.basics?.phone) {
        maskedObj.phone = originalResume.basics.phone;
    }
    if (originalResume.basics?.email) {
        maskedObj.email = originalResume.basics.email;
    }
    return maskedObj;
}

function unmaskGithub(originalGithub, maskedGithub) {
    try {
        if (typeof maskedGithub === 'string') {
            let unmasked = maskedGithub;
            const replacements = [];
            
            if (originalGithub.basics?.name) {
                const maskedName = maskdata.maskStringV2(originalGithub.basics.name, {
                    maskWith: '!',
                    unmaskedStartCharacters: 1,
                    unmaskedEndCharacters: 1,
                    maxMaskedCharacters: 10
                });
                replacements.push({ masked: maskedName, original: originalGithub.basics.name });
            }
            
            if (originalGithub.basics?.email) {
                const maskedEmail = maskdata.maskEmail2(originalGithub.basics.email, {
                    maskWith: '$',
                    unmaskedStartCharacters: 2,
                    unmaskedEndCharacters: 2,
                    maxMaskedCharacters: 4
                });
                replacements.push({ masked: maskedEmail, original: originalGithub.basics.email });
            }
            
            if (originalGithub.basics?.phone) {
                const maskedPhone = maskdata.maskPhone(originalGithub.basics.phone, {
                    maskWith: '*',
                    unmaskedStartDigits: 2,
                    unmaskedEndDigits: 2
                });
                replacements.push({ masked: maskedPhone, original: originalGithub.basics.phone });
            }
            
            replacements.forEach(({ masked, original }) => {
                const escapedMasked = escapeRegExp(masked);
                unmasked = unmasked.replace(new RegExp(escapedMasked, 'g'), original);
            });
            
            return unmasked;
        } else {
            const result = JSON.parse(JSON.stringify(maskedGithub));
            
            if (originalGithub.basics && result.basics) {
                if (originalGithub.basics.name && result.basics.name) {
                    result.basics.name = originalGithub.basics.name;
                }
                if (originalGithub.basics.email && result.basics.email) {
                    result.basics.email = originalGithub.basics.email;
                }
                if (originalGithub.basics.phone && result.basics.phone) {
                    result.basics.phone = originalGithub.basics.phone;
                }
            }
            return result;
        }
    } catch (error) {
        console.error('Error in unmaskGithub:', error);
        return maskedGithub;
    }
}

function unmaskPortfolio(originalPortfolio, maskedPortfolio) {
    let maskedObj;
    try {
        maskedObj = typeof maskedPortfolio === 'string' ? JSON.parse(maskedPortfolio) : {...maskedPortfolio};
    } catch (e) {
        return maskedPortfolio;
    }
    if (originalPortfolio.basics) {
        if (originalPortfolio.basics.name) {
            const nameParts = originalPortfolio.basics.name.split(' ');
            maskedObj.First_name = nameParts[0] || '';
            maskedObj.Last_name = nameParts.slice(1).join(' ') || '';
        }
        if (originalPortfolio.basics.email) {
            maskedObj.email = originalPortfolio.basics.email;
        }
        if (originalPortfolio.basics.phone) {
            maskedObj.phone = originalPortfolio.basics.phone;
        }
    }    
    return maskedObj;
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unmaskContent(originalData, maskedData, contentType) {
    let result;
    if (contentType === "resume") { 
        result = unmaskResume(originalData, maskedData);
    } else if (contentType === "linkedin") {
        result = unmaskLinkedIn(originalData, maskedData);
    } else if (contentType === "github") {
        result = unmaskGithub(originalData, maskedData);
    } else if (contentType === "portfolio") {
        result = unmaskPortfolio(originalData, maskedData);
    } else {
        result = maskedData;
    }
    return result;
}

module.exports = { maskContent, generateWithGroq, unmaskContent };