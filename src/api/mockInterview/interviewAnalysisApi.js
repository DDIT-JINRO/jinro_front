export const interviewAnalysisApi = {
  
  /**
   * 상세 AI 분석을 요청합니다.
   * @param {Object} analysisData - 분석 요청 데이터
   * @returns {Promise<Object>} - 분석 결과
   */
  async requestDetailedAnalysis(analysisData) {
    try {
      console.log('🚀 Gemini AI 분석 요청 시작:', analysisData);
      
      const response = await fetch('http://localhost:8080/api/interview/detailed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Gemini AI 분석 완료:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ AI 분석 요청 실패:', error);
      throw new Error(`AI 분석 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  /**
   * API 상태를 확인합니다.
   */
  async checkHealth() {
    try {
      const response = await fetch('http://localhost:8080/api/interview/health');
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', message: error.message };
    }
  }
};