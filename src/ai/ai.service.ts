import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.geminiApiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured. AI features will be mocked or disabled.');
    }
  }

  async triageIssue(complaint: string, assetContext: any): Promise<any> {
    if (!this.genAI) {
      // Mocked response for track B or if API key is missing
      return this.mockTriageIssue(complaint);
    }

    try {
      const prompt = `
        You are a professional maintenance AI assistant. Analyze the following issue report.
        
        Asset Context:
        Category: ${assetContext.category}
        Location: ${assetContext.location}
        Condition: ${assetContext.condition}
        
        User Complaint:
        "${complaint}"
        
        Provide a structured JSON output with the following fields:
        - title: A professional, concise title for the issue.
        - category: The category of the issue (e.g., Electrical, Plumbing, HVAC, Hardware).
        - priority: The suggested priority (Low, Medium, High, Critical).
        - possibleCauses: An array of 2-3 brief possible technical causes.
        - initialChecks: An array of 2-3 safe initial diagnostic checks for the technician.
        
        CRITICAL SAFETY RULE: Never suggest unsafe checks for electrical, mechanical, or fire hazards. For critical safety issues, explicitly state in initialChecks to "Ensure power is off" or "Wait for a qualified professional."
        
        Output valid JSON only, no markdown formatting blocks.
      `;

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });
      
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to triage issue with AI:', error);
      // Fallback on failure
      return this.mockTriageIssue(complaint);
    }
  }

  private mockTriageIssue(complaint: string): any {
    return {
      title: 'Reported Issue (Auto-Triage Failed)',
      category: 'General',
      priority: 'Medium',
      possibleCauses: ['Unknown (AI unavailable)'],
      initialChecks: ['Visually inspect the asset', 'Do not attempt unsafe repairs'],
    };
  }
}
