export const useCookie = () => {

  // 쿠키 조회 함수
  const getCookie = (name) => {
    const nameOfCookie = name + "="
    const cookieArray = document.cookie.split('; ');

    for (const cookie of cookieArray) {
      if (cookie.startsWith(nameOfCookie)) {
        return decodeURIComponent(cookie.substring(nameOfCookie.length));
      }
    }

    return null;
  };

  // 쿠키 생성 함수
  const setCookie = (name, value, expiredays) => {
    var todayDate = new Date();
    todayDate = new Date(
      parseInt(todayDate.getTime() / 86400000) * 86400000 + 54000000
    );

    if (todayDate > new Date()) {
      expiredays = expiredays - 1;
    }

    todayDate.setDate(todayDate.getDate() + expiredays);

    document.cookie =
      name +
      "=" +
      escape(value) +
      "; path=/; expires=" +
      todayDate.toGMTString() +
      ";";
  };

  // 쿠키 삭제 함수
  const removeCookie = (name) => {
    document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  }

  return {
    setCookie,
    removeCookie,
    getCookie,
  };
};
