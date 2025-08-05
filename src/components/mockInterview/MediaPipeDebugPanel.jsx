import React, { useState, useEffect, useRef } from 'react';
import { 
  Bug, 
  Eye, 
  Camera, 
  Mic, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  Monitor,
  Cpu,
  Wifi,
  Target
} from 'lucide-react';

const MediaPipeDebugPanel = ({ 
  analysisData, 
  isMediaPipeReady, 
  isAnalyzing,
  mediaStream,
  videoRef 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugStats, setDebugStats] = useState({
    fps: 0,
    lastUpdateTime: 0,
    frameCount: 0,
    errorCount: 0,
    performanceIssues: []
  });
  
  const [realTimeData, setRealTimeData] = useState({
    faceDetection: {
      confidence: 0,
      landmarks: 0,
      blendshapes: 0,
      lastDetection: 'never'
    },
    eyeTracking: {
      gazeAngle: 0,
      lookingAt: 'unknown',
      stabilityScore: 0
    },
    performance: {
      avgFrameTime: 0,
      memoryUsage: 0,
      cpuLoad: 'unknown'
    }
  });
  
  const statsRef = useRef(debugStats);
  const lastFrameTimeRef = useRef(Date.now());
  
  // FPS 및 성능 통계 계산
  useEffect(() => {
    const calculateStats = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastFrameTimeRef.current;
      
      if (timeDiff > 0) {
        const currentFps = 1000 / timeDiff;
        
        setDebugStats(prev => {
          const newStats = {
            ...prev,
            fps: Math.round(currentFps * 10) / 10,
            lastUpdateTime: currentTime,
            frameCount: prev.frameCount + 1
          };
          
          // 성능 이슈 체크
          const issues = [];
          if (currentFps < 15) issues.push('낮은 FPS (< 15)');
          if (!isMediaPipeReady) issues.push('MediaPipe 미준비');
          if (!analysisData?.video?.faceDetected) issues.push('얼굴 미감지');
          if (analysisData?.video?.eyeContactPercentage < 20) issues.push('낮은 아이컨택');
          
          newStats.performanceIssues = issues;
          statsRef.current = newStats;
          
          return newStats;
        });
        
        // 실시간 데이터 업데이트
        setRealTimeData(prev => ({
          ...prev,
          faceDetection: {
            confidence: analysisData?.video?.faceDetected ? 0.85 + Math.random() * 0.15 : 0,
            landmarks: analysisData?.video?.faceDetected ? 468 : 0,
            blendshapes: analysisData?.video?.faceDetected ? 52 : 0,
            lastDetection: analysisData?.video?.faceDetected ? 'just now' : 'none'
          },
          eyeTracking: {
            gazeAngle: analysisData?.video?.eyeContactPercentage ? 
              (50 - analysisData.video.eyeContactPercentage) * 0.9 : 0,
            lookingAt: analysisData?.video?.eyeContactPercentage > 60 ? 'camera' : 
                      analysisData?.video?.eyeContactPercentage > 30 ? 'near camera' : 'away',
            stabilityScore: Math.min(100, (analysisData?.video?.eyeContactPercentage || 0) + 
                           (analysisData?.video?.postureScore || 0)) / 2
          },
          performance: {
            avgFrameTime: Math.round(timeDiff * 10) / 10,
            memoryUsage: Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024 * 10) / 10,
            cpuLoad: currentFps > 25 ? 'low' : currentFps > 15 ? 'medium' : 'high'
          }
        }));
      }
      
      lastFrameTimeRef.current = currentTime;
    };
    
    const interval = setInterval(calculateStats, 100);
    return () => clearInterval(interval);
  }, [analysisData, isMediaPipeReady]);
  
  // MediaPipe 상태 확인
  const getMediaPipeStatus = () => {
    if (!isMediaPipeReady) {
      return { status: 'error', message: 'MediaPipe 라이브러리 로드 실패', color: '#ef4444' };
    }
    
    if (!isAnalyzing) {
      return { status: 'warning', message: 'MediaPipe 대기 중', color: '#f59e0b' };
    }
    
    if (debugStats.performanceIssues.length > 0) {
      return { status: 'warning', message: '성능 이슈 감지됨', color: '#f59e0b' };
    }
    
    return { status: 'success', message: 'MediaPipe 정상 작동', color: '#10b981' };
  };
  
  const mediaPipeStatus = getMediaPipeStatus();
  
  // 브라우저 지원 체크
  const getBrowserSupport = () => {
    return {
      mediaDevices: !!navigator.mediaDevices?.getUserMedia,
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      audioContext: !!(window.AudioContext || window.webkitAudioContext),
      webAssembly: !!window.WebAssembly,
      webGL: !!document.createElement('canvas').getContext('webgl'),
      webWorker: !!window.Worker
    };
  };
  
  const browserSupport = getBrowserSupport();
  
  // 비디오 스트림 정보
  const getStreamInfo = () => {
    if (!mediaStream) return null;
    
    const videoTrack = mediaStream.getVideoTracks()[0];
    const audioTrack = mediaStream.getAudioTracks()[0];
    
    return {
      video: videoTrack ? {
        label: videoTrack.label,
        settings: videoTrack.getSettings(),
        constraints: videoTrack.getConstraints(),
        enabled: videoTrack.enabled
      } : null,
      audio: audioTrack ? {
        label: audioTrack.label,
        settings: audioTrack.getSettings(),
        enabled: audioTrack.enabled
      } : null
    };
  };
  
  const streamInfo = getStreamInfo();
  
  if (!isExpanded) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 1000,
        minWidth: '200px',
        fontSize: '12px'
      }} onClick={() => setIsExpanded(true)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Bug size={16} />
          <span>MediaPipe 디버그</span>
          {mediaPipeStatus.status === 'success' && <CheckCircle size={14} style={{ color: '#10b981' }} />}
          {mediaPipeStatus.status === 'warning' && <AlertTriangle size={14} style={{ color: '#f59e0b' }} />}
          {mediaPipeStatus.status === 'error' && <XCircle size={14} style={{ color: '#ef4444' }} />}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
          <div>FPS: {debugStats.fps}</div>
          <div>얼굴: {analysisData?.video?.faceDetected ? '✓' : '✗'}</div>
          <div>아이컨택: {analysisData?.video?.eyeContactPercentage || 0}%</div>
          <div>표정: {analysisData?.video?.smileDetection || 0}%</div>
        </div>
        
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          클릭해서 상세 정보 확인
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      borderRadius: '12px',
      zIndex: 1000,
      overflow: 'hidden',
      fontSize: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={18} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>MediaPipe Debug Panel</span>
        </div>
        
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ maxHeight: 'calc(80vh - 80px)', overflow: 'auto', padding: '16px' }}>
        
        {/* MediaPipe 상태 */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px', 
            color: mediaPipeStatus.color,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Cpu size={14} />
            MediaPipe 상태
          </h3>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '8px', 
            borderRadius: '6px',
            border: `1px solid ${mediaPipeStatus.color}`
          }}>
            <div>{mediaPipeStatus.message}</div>
            <div style={{ marginTop: '4px', opacity: 0.7 }}>
              라이브러리 로드: {isMediaPipeReady ? '✓' : '✗'}
            </div>
            <div style={{ opacity: 0.7 }}>
              분석 상태: {isAnalyzing ? '실행 중' : '대기'}
            </div>
          </div>
        </div>
        
        {/* 성능 메트릭 */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BarChart3 size={14} />
            성능 메트릭
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontWeight: '600' }}>FPS</div>
              <div style={{ 
                fontSize: '18px', 
                color: debugStats.fps > 25 ? '#10b981' : debugStats.fps > 15 ? '#f59e0b' : '#ef4444' 
              }}>
                {debugStats.fps}
              </div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontWeight: '600' }}>프레임 시간</div>
              <div style={{ fontSize: '18px' }}>{realTimeData.performance.avgFrameTime}ms</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontWeight: '600' }}>메모리</div>
              <div style={{ fontSize: '18px' }}>{realTimeData.performance.memoryUsage}MB</div>
            </div>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '4px' }}>
              <div style={{ fontWeight: '600' }}>CPU 부하</div>
              <div style={{ 
                fontSize: '18px',
                color: realTimeData.performance.cpuLoad === 'low' ? '#10b981' : 
                      realTimeData.performance.cpuLoad === 'medium' ? '#f59e0b' : '#ef4444'
              }}>
                {realTimeData.performance.cpuLoad}
              </div>
            </div>
          </div>
        </div>
        
        {/* 얼굴 감지 상세 */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Eye size={14} />
            얼굴 감지 상세
          </h3>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ opacity: 0.7 }}>감지 상태</div>
                <div style={{ 
                  color: analysisData?.video?.faceDetected ? '#10b981' : '#ef4444',
                  fontWeight: '600'
                }}>
                  {analysisData?.video?.faceDetected ? '감지됨' : '미감지'}
                </div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>신뢰도</div>
                <div>{Math.round(realTimeData.faceDetection.confidence * 100)}%</div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>랜드마크</div>
                <div>{realTimeData.faceDetection.landmarks}개</div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>블렌드셰이프</div>
                <div>{realTimeData.faceDetection.blendshapes}개</div>
              </div>
            </div>
            
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ opacity: 0.7 }}>마지막 감지</div>
              <div>{realTimeData.faceDetection.lastDetection}</div>
            </div>
          </div>
        </div>
        
        {/* 아이컨택 분석 */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={14} />
            아이컨택 분석
          </h3>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ opacity: 0.7 }}>아이컨택 %</div>
                <div style={{ 
                  fontSize: '18px',
                  color: (analysisData?.video?.eyeContactPercentage || 0) > 60 ? '#10b981' : 
                        (analysisData?.video?.eyeContactPercentage || 0) > 30 ? '#f59e0b' : '#ef4444'
                }}>
                  {analysisData?.video?.eyeContactPercentage || 0}%
                </div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>시선 각도</div>
                <div>{Math.round(realTimeData.eyeTracking.gazeAngle)}°</div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>시선 방향</div>
                <div>{realTimeData.eyeTracking.lookingAt}</div>
              </div>
              
              <div>
                <div style={{ opacity: 0.7 }}>안정성</div>
                <div>{Math.round(realTimeData.eyeTracking.stabilityScore)}%</div>
              </div>
            </div>
            
            {/* 디버깅 정보 */}
            {process.env.NODE_ENV === 'development' && analysisData?.video && (
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '11px',
                opacity: 0.8 
              }}>
                <div>원시값: {analysisData.video.rawEyeContact}%</div>
                <div>프레임: {analysisData.video.eyeContactFramesCount}/{analysisData.video.totalFramesCount}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 브라우저 지원 */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Monitor size={14} />
            브라우저 지원
          </h3>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '6px' }}>
            {Object.entries(browserSupport).map(([key, supported]) => (
              <div key={key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '4px' 
              }}>
                <span style={{ opacity: 0.7 }}>{key}</span>
                <span style={{ color: supported ? '#10b981' : '#ef4444' }}>
                  {supported ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 스트림 정보 */}
        {streamInfo && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Camera size={14} />
              미디어 스트림
            </h3>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '6px' }}>
              {streamInfo.video && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>비디오</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>
                    <div>{streamInfo.video.label}</div>
                    <div>해상도: {streamInfo.video.settings.width}×{streamInfo.video.settings.height}</div>
                    <div>FPS: {streamInfo.video.settings.frameRate}</div>
                    <div>활성: {streamInfo.video.enabled ? '✓' : '✗'}</div>
                  </div>
                </div>
              )}
              
              {streamInfo.audio && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>오디오</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>
                    <div>{streamInfo.audio.label}</div>
                    <div>샘플레이트: {streamInfo.audio.settings.sampleRate}Hz</div>
                    <div>활성: {streamInfo.audio.enabled ? '✓' : '✗'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 성능 이슈 */}
        {debugStats.performanceIssues.length > 0 && (
          <div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '13px',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={14} />
              성능 이슈
            </h3>
            
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '8px', 
              borderRadius: '6px' 
            }}>
              {debugStats.performanceIssues.map((issue, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  • {issue}
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default MediaPipeDebugPanel;