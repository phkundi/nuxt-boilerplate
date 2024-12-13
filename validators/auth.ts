export const loginFormValidation = {
  email: [
    { required: true, message: "Email is required." },
    {
      custom: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address.",
    },
  ],
  password: [{ required: true, message: "Password is required." }],
};

export const registerFormValidation = {
  first_name: [{ required: true, message: "First name is required." }],
  email: [
    { required: true, message: "Email is required." },
    {
      custom: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address.",
    },
  ],
  password: [
    { required: true, message: "Password is required." },
    { minLength: 6, message: "Password must be at least 6 characters." },
  ],
  password2: [
    { required: true, message: "Repeat password is required." },
    { match: "password", message: "Passwords do not match." },
  ],
  accept_terms: [
    {
      custom: (value: boolean) => value === true,
      message: "Accept our terms to continue",
    },
  ],
};
