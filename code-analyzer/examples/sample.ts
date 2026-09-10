/**
 * Sample TypeScript module for analysis
 */

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * API Service - handles too much
 */
class APIService {
  private baseURL: string = "http://api.example.com";

  /**
   * Fetch user data - too many parameters
   */
  async fetchUserData(
    userId: string,
    includeProfile: boolean,
    includeSettings: boolean,
    includePosts: boolean,
    includeFollowers: boolean,
    includeFollowing: boolean,
    format: string
  ): Promise<UserData> {
    const url = `${this.baseURL}/users/${userId}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Callback hell - too many nested callbacks
   */
  loadUserWithCallback(userId: string, callback: Function) {
    this.fetchData(userId, (err: any, user: any) => {
      if (err) {
        callback(err);
      } else {
        this.fetchPermissions(user.id, (err2: any, perms: any) => {
          if (err2) {
            callback(err2);
          } else {
            this.fetchSettings(user.id, (err3: any, settings: any) => {
              callback(null, { user, perms, settings });
            });
          }
        });
      }
    });
  }

  private fetchData(id: string, callback: Function): void {
    // Implementation
  }

  private fetchPermissions(id: string, callback: Function): void {
    // Implementation
  }

  private fetchSettings(id: string, callback: Function): void {
    // Implementation
  }

  /**
   * Complex conditional logic
   */
  validateUserAccess(user: any): boolean {
    if (user !== null && user !== undefined) {
      if (user.isActive === true) {
        if (user.role === "admin" || user.role === "moderator") {
          if (user.permissions && user.permissions.length > 0) {
            if (user.permissions.includes("write")) {
              if (user.lastLoginDate) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Magic numbers throughout
   */
  calculateDelay(retryCount: number): number {
    if (retryCount === 0) {
      return 1000;
    } else if (retryCount === 1) {
      return 2000;
    } else if (retryCount === 2) {
      return 4000;
    } else if (retryCount === 3) {
      return 8000;
    } else if (retryCount === 4) {
      return 15000;
    }
    return 30000;
  }

  /**
   * Duplicate error handling
   */
  handleError1(error: any): void {
    if (error === null) {
      console.log("No error");
      return;
    }
    if (error === undefined) {
      console.log("Undefined error");
      return;
    }
    console.error("Error occurred:", error);
  }

  handleError2(error: any): void {
    if (error === null) {
      console.log("No error");
      return;
    }
    if (error === undefined) {
      console.log("Undefined error");
      return;
    }
    console.error("Error occurred:", error);
  }
}

/**
 * Utility functions with poor naming
 */
function processData(data: any): any {
  return data.map((item: any) => item * 2);
}

function validateData(x: any): boolean {
  return x !== null && x !== undefined && x.length > 0;
}

function transformData(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
