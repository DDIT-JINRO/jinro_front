const backUrl = import.meta.env.VITE_BACK_END_URL;

/**
 * 구름의 상태를 나타내는 상수 객체
 * - LOCKED: 미션이 잠겨 있어 접근할 수 없는 상태.
 * - UNLOCKED: 미션이 해금되어 수락할 수 있는 상태.
 * - PROGRESS: 미션이 수락되어 진행 중인 상태.
 * - COMPLETED: 미션이 완료된 상태.
 */
export const CLOUD_STATE = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  PROGRESS: 'progress',
  COMPLETED: 'completed',
};

// 로드맵의 단계를 그룹화한 상수 데이터
export const STAGE_GROUPS = {
  1: [1],
  2: [2, 3, 4],
  3: [5, 6, 7],
  4: [8, 9, 10],
  5: [11],
};

// 스테이지별 컴포넌트 위치 상수 데이터
export const STAGE_POSITIONS = [
  {
    id: 1,
    cloud: { top: "85%", left: "42%" },
    char: { top: "79%", left: "48%" },
    sign: { top: "89%", left: "45%" },
  },
  {
    id: 2,
    cloud: { top: "70%", left: "20%" },
    char: { top: "62%", left: "27%" },
    sign: { top: "72%", left: "25%" },
  },
  {
    id: 3,
    cloud: { top: "67.5%", left: "42%" },
    char: { top: "60%", left: "45%" },
    sign: { top: "67%", left: "52%" },
  },
  {
    id: 4,
    cloud: { top: "70%", left: "65%" },
    char: { top: "63%", left: "67%" },
    sign: { top: "70%", left: "75%" },
  },
  {
    id: 5,
    cloud: { top: "50%", left: "15%" },
    char: { top: "42%", left: "23%" },
    sign: { top: "51%", left: "20%" },
  },
  {
    id: 6,
    cloud: { top: "50%", left: "42%" },
    char: { top: "42%", left: "49%" },
    sign: { top: "52%", left: "46%" },
  },
  {
    id: 7,
    cloud: { top: "50%", left: "70%" },
    char: { top: "43%", left: "72%" },
    sign: { top: "50%", left: "80%" },
  },
  {
    id: 8,
    cloud: { top: "27%", left: "21%" },
    char: { top: "20%", left: "30%" },
    sign: { top: "28%", left: "26%" },
  },
  {
    id: 9,
    cloud: { top: "31%", left: "42%" },
    char: { top: "24%", left: "44%" },
    sign: { top: "31%", left: "52%" },
  },
  {
    id: 10,
    cloud: { top: "28%", left: "65%" },
    char: { top: "22%", left: "67%" },
    sign: { top: "28%", left: "75%" },
  },
  {
    id: 11,
    cloud: { top: "12%", left: "42%" },
    char: { top: "6%", left: "50%" },
    sign: { top: "14%", left: "48%" },
  },
];

// 바로가기 URL 상수 데이터
export const SHORT_CUT_URL = [
  `${backUrl}/mpg/mif/inq/selectMyInquiryView.do`,
  `${backUrl}/pse/cat/careerAptitudeTest.do`,
  `${backUrl}/`,
  `${backUrl}/pse/cr/crl/selectCareerList.do`,
  `${backUrl}/prg/std/stdGroupList.do`,
  `${backUrl}/cnslt/off/crsv/offlineReservation.do`,
  `${backUrl}/comm/peer/teen/teenList.do`,
  `${backUrl}/cdp/rsm/rsm/resumeList.do`,
  `${backUrl}/cdp/sint/qestnlst/questionList.do`,
  `${backUrl}/cdp/imtintrvw/aiimtintrvw/aiImitationInterview.do`
]