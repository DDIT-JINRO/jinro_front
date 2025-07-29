/**
 * AI 면접 분석 API 서비스
 * 실제 백엔드 AI 분석 서버와 연동하는 서비스
 */

const API_BASE_URL = 'http://localhost:8080/api/ai-analysis';

export class AIAnalysisService {
  
  /**
   * 면접 영상을 업로드하고 AI 분석을 요청
   * @param {Object} interviewData - 면접 데이터
   * @returns {Promise<Object>} 분석 결과
   */
  static async analyzeInterview(interviewData) {
    const { videoBlob, answers, questions, recordingDuration } = interviewData;
    
    try {
      // FormData로 영상 파일과 메타데이터 전송
      const formData = new FormData();
      
      // 영상 파일 추가
      if (videoBlob) {
        formData.append('video', videoBlob, 'interview-recording.webm');
      }
      
      // 면접 메타데이터 추가
      formData.append('interviewData', JSON.stringify({
        answers,
        questions,
        recordingDuration,
        timestamp: new Date().toISOString()
      }));
      
      console.log('🚀 AI 분석 API 요청 시작...');
      
      // Spring Boot 백엔드로 분석 요청
      const response = await fetch(`${API_BASE_URL}/analyze-interview`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Content-Type은 FormData 사용 시 자동 설정
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ AI 분석 완료:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ AI 분석 API 오류:', error);
      throw error;
    }
  }
  
  /**
   * 분석 진행 상황 폴링
   * @param {string} analysisId - 분석 작업 ID
   * @returns {Promise<Object>} 진행 상황
   */
  static async getAnalysisProgress(analysisId) {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/${analysisId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ 분석 진행상황 조회 오류:', error);
      throw error;
    }
  }
  
  /**
   * 분석 보고서 다운로드
   * @param {string} analysisId - 분석 ID
   * @returns {Promise<Blob>} PDF 보고서
   */
  static async downloadReport(analysisId) {
    try {
      const response = await fetch(`${API_BASE_URL}/report/${analysisId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-analysis-${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return blob;
      
    } catch (error) {
      console.error('❌ 보고서 다운로드 오류:', error);
      throw error;
    }
  }
  
  /**
   * 이전 분석 결과 조회
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 이전 분석 결과 목록
   */
  static async getAnalysisHistory(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ 분석 이력 조회 오류:', error);
      throw error;
    }
  }
}

/**
 * 실제 백엔드 구현을 위한 Spring Boot Controller 예시
 * 
 * @RestController
 * @RequestMapping("/api/ai-analysis")
 * public class AIAnalysisController {
 * 
 *   @PostMapping("/analyze-interview")
 *   public ResponseEntity<AnalysisResponse> analyzeInterview(
 *       @RequestParam("video") MultipartFile videoFile,
 *       @RequestParam("interviewData") String interviewDataJson) {
 *       
 *       try {
 *           // 1. 영상 파일 저장
 *           String videoPath = saveVideoFile(videoFile);
 *           
 *           // 2. 면접 데이터 파싱
 *           InterviewData interviewData = parseInterviewData(interviewDataJson);
 *           
 *           // 3. AI 분석 서비스 호출
 *           // - 영상 분석: OpenCV, MediaPipe 등
 *           // - 음성 분석: Google Speech-to-Text, AWS Transcribe 등
 *           // - 텍스트 분석: OpenAI GPT, Google NLP 등
 *           AnalysisResult result = aiAnalysisService.analyze(videoPath, interviewData);
 *           
 *           return ResponseEntity.ok(result);
 *           
 *       } catch (Exception e) {
 *           return ResponseEntity.status(500).body(new ErrorResponse(e.getMessage()));
 *       }
 *   }
 *   
 *   @GetMapping("/progress/{analysisId}")
 *   public ResponseEntity<ProgressResponse> getProgress(@PathVariable String analysisId) {
 *       // Redis 등에서 진행상황 조회
 *       return ResponseEntity.ok(progressService.getProgress(analysisId));
 *   }
 * }
 */

/**
 * AI 분석에 사용할 수 있는 라이브러리/서비스들:
 * 
 * 1. 영상 분석:
 *    - MediaPipe (Google): 얼굴/포즈 감지
 *    - OpenCV: 컴퓨터 비전 처리
 *    - Azure Face API: 감정/시선 분석
 *    - AWS Rekognition: 영상 콘텐츠 분석
 * 
 * 2. 음성 분석:
 *    - Google Speech-to-Text: 음성 인식
 *    - AWS Transcribe: 음성을 텍스트로 변환
 *    - Microsoft Speech Services: 음성 분석
 *    - Librosa (Python): 음성 특성 분석
 * 
 * 3. 텍스트 분석:
 *    - OpenAI GPT API: 답변 품질 평가
 *    - Google Cloud Natural Language: 감정/키워드 분석
 *    - AWS Comprehend: 텍스트 분석
 *    - KoBERT: 한국어 특화 자연어 처리
 */