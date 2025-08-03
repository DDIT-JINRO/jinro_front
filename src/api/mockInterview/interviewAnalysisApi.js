const backUrl = import.meta.env.VITE_BACK_END_URL;

export const interviewAnalysisApi = {
  
  /**
   * 🎯 면접 분석을 요청합니다. (백엔드 연동)
   * @param {Object} analysisData - 분석 요청 데이터
   * @returns {Promise<Object>} - 분석 결과
   */
  async requestDetailedAnalysis(analysisData) {
    try {
      console.log('🚀 면접 분석 요청 시작:', analysisData);
      
      const response = await fetch(`${backUrl}/api/analyze-interview`, { // 🎯 URL 변경
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.message || `서버 응답 오류: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ 면접 분석 완료:', result);
      
      // 🎯 백엔드 응답 검증
      if (!result.success && result.success !== undefined) {
        throw new Error(result.message || '분석이 실패했습니다.');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 면접 분석 요청 실패:', error);
      
      // 🎯 네트워크 오류와 서버 오류 구분
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      
      throw new Error(`면접 분석 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  /**
   * 🎯 분석 진행 상태를 확인합니다.
   * @param {string} sessionId - 세션 ID
   * @returns {Promise<Object>} - 진행 상태
   */
  async checkAnalysisProgress(sessionId) {
    try {
      const response = await fetch(`${backUrl}/api/analyze-interview/progress/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`진행 상태 확인 실패: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ 분석 진행 상태 확인 실패:', error);
      return { progress: 0, status: 'error', message: error.message };
    }
  },
  
  /**
   * 🎯 API 상태를 확인합니다.
   */
  async checkHealth() {
    try {
      const response = await fetch(`${backUrl}/api/analyze-interview/health`, { // 🎯 URL 변경
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { 
          status: 'ERROR', 
          message: `서버 응답 오류: ${response.status}` 
        };
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Health check 실패:', error);
      return { 
        status: 'ERROR', 
        message: `서버 연결 실패: ${error.message}` 
      };
    }
  },

  /**
   * 🎯 분석을 취소합니다.
   * @param {string} sessionId - 세션 ID
   */
  async cancelAnalysis(sessionId) {
    try {
      const response = await fetch(`${backUrl}/api/analyze-interview/cancel/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ 분석 취소 실패:', error);
      return { success: false, message: error.message };
    }
  }
};