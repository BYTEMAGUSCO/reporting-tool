export class AccountManager {
  constructor(org) {
    this.org = org;
    this.apiUrl = "https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/request-registration";
    this.loginUrl = "https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/sign-in";
    this.maxRetries = 2;
  }

  sanitize(formData) {
    const sanitized = { ...formData };
    for (const key in sanitized) {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = sanitized[key].trim();
      }
    }
    return sanitized;
  }

  validate(formData) {
    const errors = {};

    if (
      !formData.requester_email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email)
    ) {
      errors.requester_email = "Invalid email format";
    }

    if (
      !formData.requester_phone ||
      !/^[0-9+\-().\s]{7,}$/.test(formData.requester_phone)
    ) {
      errors.requester_phone = "Invalid phone number";
    }

    if (!formData.requester_password || formData.requester_password.length < 6) {
      errors.requester_password = "Password must be at least 6 characters";
    }

    if (!formData.requester_name || formData.requester_name.length < 2) {
      errors.requester_name = "Name is too short";
    }

    if (!formData.requester_role) {
      errors.requester_role = "Role is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  async register(formData) {
    const cleanedData = this.sanitize(formData);
    const { isValid, errors } = this.validate(cleanedData);

    if (!isValid) {
      return {
        success: false,
        message: "Validation failed 💔",
        validationErrors: errors,
      };
    }

    return await this.tryRegister(cleanedData, this.maxRetries);
  }

  async tryRegister(payload, retriesLeft) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Something went wrong ❌",
        };
      }

      return {
        success: true,
        message: result.message || "Registration request sent ✅",
      };
    } catch (err) {
      console.error(`🌐 Network error (${this.maxRetries - retriesLeft + 1} attempt):`, err);
      if (retriesLeft > 0) {
        return this.tryRegister(payload, retriesLeft - 1);
      }

      return {
        success: false,
        message: "Network error 💥 All retries failed",
      };
    }
  }

async login(email, password) {
  try {
    const response = await fetch(this.loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const rawText = await response.text();
    let result;

    try {
      result = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err);
      return {
        success: false,
        message: "Invalid server response 💀",
      };
    }

    if (!response.ok || result?.error) {
      return {
        success: false,
        message: result?.error?.message || result?.message || "Login failed ❌",
        code: result?.error?.code || "unknown_error",
        status: result?.error?.status || response.status,
      };
    }

    const userRole = result.user?.user_metadata?.role;

    // 🚫 Restrict Role B in OrgA
    if (this.org?.toLowerCase() === "orga" && userRole?.toUpperCase() === "B") {
      return {
        success: false,
        message: "Barangay Account not Allowed to Log In to DILG",
        code: "forbidden_login",
      };
    }

    sessionStorage.setItem("session", JSON.stringify(result.session));

    return {
      success: true,
      data: result,
      message: "Logged in successfully ✅",
    };
  } catch (err) {
    console.error("💥 Login network/unexpected error:", err);
    return {
      success: false,
      message: "Network error 💥",
      error: err.message,
    };
  }
}


  getAllAccounts() {
    return [];
  }

  static loadAllAccounts() {
    return [];
  }
}
