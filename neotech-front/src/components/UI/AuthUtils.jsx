const AuthUtils = {
  // Check if user is authenticated by looking for token in cookies
  isAuthenticated() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name] = cookie.trim().split('=');
      // Check for common token cookie names
      if (name === 'token' || name === 'authToken' || name === 'accessToken' || name === 'jwt') {
        return true;
      }
    }
    return false;
  },

  getToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' || name === 'authToken' || name === 'accessToken' || name === 'jwt') {
        return value;
      }
    }
    return null;
  }
};

export default AuthUtils;
