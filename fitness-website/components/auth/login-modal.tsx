"use client";

import type React from "react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";



// A simple component for social login buttons for better reusability
const SocialLogins = () => (
  <>
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
    </div>
  </>
);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, forgetPassword, verifyOtp } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // ✅ الحالة الابتدائية الصحيحة
  // Separate visibility toggles to avoid cross-tab coupling
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmNewPassword, setShowResetConfirmNewPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [registerStep, setRegisterStep] = useState(1);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "otp">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const initialRegisterData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    country: "",
    user_type: "",
  };
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [submitted, setSubmitted] = useState(false);
  const [nameWarning, setNameWarning] = useState("");
  const MAX_NAME_LENGTH = 30;
  const MIN_PASSWORD_LENGTH = 6;
  const MAX_PASSWORD_LENGTH = 18;

// Regex explanation:
// (?=.*[a-z])      -> at least one lowercase
// (?=.*[A-Z])      -> at least one uppercase
// (?=.*\d)         -> at least one number
// (?=.*[!@#$%^&*]) -> at least one special char
const PASSWORD_PATTERN =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{" +
  MIN_PASSWORD_LENGTH +
  "," +
  MAX_PASSWORD_LENGTH +
  "}$";

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleClose = useCallback(() => {
    setMessage(null);
    setLoginData({ email: "", password: "" });
    setRegisterData(initialRegisterData);
    setRegisterStep(1);
    setResetStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    // reset visibility toggles to default
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setShowResetNewPassword(false);
    setShowResetConfirmNewPassword(false);
    onClose();
  }, [onClose, initialRegisterData]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      const email = loginData.email.trim();
      const password = loginData.password;
      if (!validateEmail(email)) {
        setMessage({ type: "error", text: "Please enter a valid email." });
        return;
      }
      if (!validatePassword(password)) {
        setMessage({
          type: "error",
          text: "Password must be at least 8 characters.",
        });
        return;
      }
      setLoginLoading(true);
      try {
        const result = await login(email, password);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setTimeout(() => handleClose(), 1500);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setLoginLoading(false);
      }
    },
    [loginData, login, handleClose]
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      setSubmitted(true);
      const name = registerData.name.trim();
      const email = registerData.email.trim();
      const password = registerData.password;
      const confirm = registerData.confirmPassword;
      const phone = registerData.phone.trim();
      const address = registerData.address.trim();
      const country = registerData.country.trim();
      const userType = (registerData.user_type || "").toLowerCase();


      if (!name) {
        setMessage({ type: "error", text: "Please enter your name." });
        return;
      }
      if (!validateEmail(email)) {
        setMessage({ type: "error", text: "Please enter a valid email." });
        return;
      }
      if (!validatePassword(password)) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        return;
      }
      if (password !== confirm) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
      if (!userType) {
        setMessage({ type: "error", text: "Please select a user type." });
        return;
      }
      setRegisterLoading(true);
      try {
        const response = await register(
          name,
          email,
          password,
          phone,
          address,
          country,
          userType
        );
        if (response.success) {
          // Improve flow: switch to login, prefill email
          setMessage({ type: "success", text: " Account created successfully! Please sign in." });
          setActiveTab("login");
          setLoginData({ email, password: "" });
        } else {
          setMessage({ type: "error", text: response.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setRegisterLoading(false);
      }
    },
    [registerData, register, handleClose]
  );

  const handleRegistrationContinue = () => {
    setMessage(null);
    if (!registerData.name.trim()) {
      setMessage({ type: "error", text: "Please enter your name." });
      return;
    }
    if (!validateEmail(registerData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email." });
      return;
    }
    if (!validatePassword(registerData.password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (!registerData.user_type) {
      setMessage({ type: "error", text: "Please select a user type." });
      return;
    }
    setRegisterStep(2);
  };

  const handleForgetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      const email = resetEmail.trim();
      if (!validateEmail(email)) {
        setMessage({ type: "error", text: "Please enter a valid email." });
        return;
      }
      setForgetPasswordLoading(true);
      try {
        const result = await forgetPassword(email);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setResetStep("otp");
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setForgetPasswordLoading(false);
      }
    },
    [resetEmail, forgetPassword]
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);
      if (!otp.trim() || otp.length < 6) {
        setMessage({ type: "error", text: "Please enter a valid OTP." });
        return;
      }
      if (!validatePassword(newPassword)) {
        setMessage({
          type: "error",
          text: "New password must be at least 6 characters.",
        });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
      setVerifyOtpLoading(true);
      try {
        const email = resetEmail.trim();
        const code = otp.trim();
        const result = await verifyOtp(email, code, newPassword);
        if (result.success) {
          setMessage({ type: "success", text: result.message });
          setTimeout(() => {
            handleClose();
            setActiveTab("login");
          }, 1500);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setVerifyOtpLoading(false);
      }
    },
    [otp, newPassword, confirmNewPassword, resetEmail, verifyOtp, handleClose]
  );

  // Derived validity states for disabling buttons and showing inline validation hints
  const isLoginValid = validateEmail(loginData.email.trim()) && validatePassword(loginData.password);
  const isRegisterStep1Valid =
    !!registerData.name.trim() &&
    validateEmail(registerData.email.trim()) &&
    validatePassword(registerData.password) &&
    registerData.password === registerData.confirmPassword &&
    !!registerData.user_type;
  const isResetEmailValid = validateEmail(resetEmail.trim());
  const isOtpValid = otp.trim().length >= 6 && validatePassword(newPassword) && newPassword === confirmNewPassword;

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setMessage(null);
    setRegisterStep(1);
    setResetStep("email");
    // also reset visibility toggles when switching tabs
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setShowResetNewPassword(false);
    setShowResetConfirmNewPassword(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-md sm:max-w-[90%] max-h-[95vh] overflow-y-auto p-0 bg-slate-50">
        <div className="p-6">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-3xl font-extrabold text-gray-900">
              {activeTab === "login" && "Welcome Back!"}
              {activeTab === "register" && "Create Your Account"}
              {activeTab === "forgot-password" && "Reset Password"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              {activeTab === "login" &&
                "Sign in to continue your fitness journey."}
              {activeTab === "register" &&
                "Join FitOrigin and start achieving your goals."}
              {activeTab === "forgot-password" &&
                "Enter your email to receive a reset code."}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* ✅ FIX: Corrected the values to be consistent */}
            <TabsList className="grid w-full grid-cols-3 bg-slate-200/60 rounded-lg p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="forgot-password"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 font-semibold text-slate-600 transition-all duration-200"
              >
                Reset
              </TabsTrigger>
            </TabsList>

            {message && (
              <div className="mt-4">
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={
                    message.type === "success"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription
                    className={
                      message.type === "success" ? "text-green-800" : ""
                    }
                  >
                    {message.text}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* ✅ FIX: `value` now matches the trigger value "login" */}
            <TabsContent value="login" className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  {loginData.email && !validateEmail(loginData.email.trim()) && (
                    <p className="text-sm text-red-600">Please enter a valid email.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {loginData.password && !validatePassword(loginData.password) && (
                    <p className="text-sm text-red-600">Password must be at least 6 characters.</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={loginLoading || !isLoginValid}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing
                      In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-blue-600 hover:underline"
                  onClick={() => setActiveTab("forgot-password")}
                >
                  Forgot Password?
                </Button>
                <SocialLogins />
              </form>
            </TabsContent>

           
            <TabsContent value="register" className="pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {registerStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        
                      
                          <Input
                                id="register-name"
                                maxLength={30}
                                placeholder="Enter Your Name."
                                value={registerData.name}
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  const cleanedValue = rawValue.replace(/[^a-zA-Z\s]/g, "");

                                  // Update the input (filtered)
                                  setRegisterData({ ...registerData, name: cleanedValue });

                                  // If the user tried to type something invalid, show a warning
                                  if (rawValue !== cleanedValue) {
                                    setNameWarning("⚠️ Name cannot include numbers or special characters.");
                                    
                                    // Auto-hide the warning after 2 seconds
                                    setTimeout(() => setNameWarning(""), 2000);
                                  }
                                  if (cleanedValue.length === MAX_NAME_LENGTH) {
                                       setNameWarning(`⚠️  Maximum ${MAX_NAME_LENGTH} characters allowed.`);
                                       setTimeout(() => setNameWarning(""), 2000);
                                     }
                                }}
                                className="pl-10 h-11"
                                required
                              />

                              {nameWarning && (
                                <p className="text-sm text-yellow-600 mt-1 transition-opacity duration-300">
                                  {nameWarning}
                                </p>
                              )}


                      </div>
                      {registerData.name !== "" && registerData.name.trim() === "" && (
                        <p className="text-sm text-red-600">Please enter your name.</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                      {registerData.email && !validateEmail(registerData.email.trim()) && (
                        <p className="text-sm text-red-600">Please enter a valid email.</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          {/* password */}
                         
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="••••••••"
                            minLength={MIN_PASSWORD_LENGTH}
                            maxLength={MAX_PASSWORD_LENGTH}
                            pattern={PASSWORD_PATTERN}
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            } 
                            className="pl-10 pr-10 h-11"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {registerData.password && !validatePassword(registerData.password) && (
                          <p className="text-sm text-red-600">Password must be at least 6 characters.</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="register-confirm-password">
                          Confirm
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="register-confirm-password"
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="pl-10 pr-10 h-11"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showRegisterConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                          <p className="text-sm text-red-600">Passwords do not match.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-user-type">I am a...</Label>
                      <select
                        id="register-user-type"
                        value={registerData.user_type}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            user_type: e.target.value,
                          })
                        }
                        required
                        className="w-full rounded-md border border-gray-300 p-2 h-11 bg-white"
                      >
                        <option value="" disabled>
                          Select user type
                        </option>
                        <option value="Coach">Coach</option>
                        <option value="Trainee">Trainee</option>
                      </select>
                      { submitted && registerData.user_type === "" && (
                        <p className="text-sm text-red-600">Please select a user type.</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleRegistrationContinue}
                      className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      Continue
                    </Button>
                    <SocialLogins />
                  </div>
                )}
                {registerStep === 2 && (
                  <div className="space-y-4">
                    {/* <div className="space-y-1">
                      <Label htmlFor="register-phone">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="Your phone number"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phone: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div> */}
                    <div className="space-y-1">
                          <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                          <div className="relative">
                            {/* Phone icon */}
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />

                            {/* Dynamic phone input */}
                            <PhoneInput
                              country={"eg"} // Default country (change as needed)
                              value={registerData.phone}
                              onChange={(value) =>
                                setRegisterData({ ...registerData, phone: value })
                              }
                              inputStyle={{
                                width: "100%",
                                height: "44px",
                                fontSize: "14px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                paddingLeft: "48px", // space for the icon
                              }}
                              buttonStyle={{
                                border: "1px solid #d1d5db",
                                backgroundColor: "#f9fafb",
                              }}
                              containerStyle={{ width: "100%" }}
                              inputProps={{
                                name: "phone",
                                id: "register-phone",
                              }}
                            />
                          </div>

                          {/* Warning message */}
                          {!registerData.phone.startsWith("+") && registerData.phone && (
                            <p className="text-sm text-red-600">
                              ⚠️ The country code number is missed in the phone number field.
                            </p>
                          )}
                      </div>

                    <div className="space-y-1">
                      <Label htmlFor="register-country">
                        Country (Optional)
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-country"
                          placeholder="Your country"
                          value={registerData.country}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              country: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-address">
                        Address (Optional)
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="register-address"
                          placeholder="Your address"
                          value={registerData.address}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              address: e.target.value,
                            })
                          }
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => setRegisterStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        disabled={registerLoading || !isRegisterStep1Valid}
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="forgot-password" className="pt-4">
              {resetStep === "email" && (
                <form onSubmit={handleForgetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your registered email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                    {resetEmail && !isResetEmailValid && (
                      <p className="text-sm text-red-600">Please enter a valid email.</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    disabled={forgetPasswordLoading || !isResetEmailValid}
                  >
                    {forgetPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Sending Code...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </Button>
                </form>
              )}
              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="otp">Verification Code (OTP)</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-11 tracking-widest text-center"
                      required
                    />
                    {otp && otp.trim().length < 6 && (
                      <p className="text-sm text-red-600">OTP must be 6 characters.</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="new-password"
                        type={showResetNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                      {!validatePassword(newPassword) && newPassword !== "" && (
                        <p className="text-sm text-red-600 mt-2">New password must be at least 6 characters.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showResetNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-new-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirm-new-password"
                        type={showResetConfirmNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                      {confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="text-sm text-red-600 mt-2">New passwords do not match.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmNewPassword(!showResetConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showResetConfirmNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    disabled={verifyOtpLoading || !isOtpValid}
                  >
                    {verifyOtpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
