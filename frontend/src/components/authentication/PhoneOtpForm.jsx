import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { AUTH_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { RoleSelector } from "./AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Phone + OTP login/signup.
 *
 * Step 1: enter phone → request OTP (server says if the number is new).
 * Step 2: enter the code — plus name + role if it's a new account — to
 *         verify. Existing numbers log straight in.
 */
function PhoneOtpForm() {
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`${AUTH_API_END_POINT}/otp/request`, {
        phoneNumber: phone,
      });
      if (res.data.success) {
        setIsNewUser(res.data.data.isNewUser);
        setStep("otp");
        // In dev the server returns the code so you can test without SMS.
        if (res.data.data.devOtp) {
          toast.info(`Dev OTP: ${res.data.data.devOtp}`, { duration: 8000 });
        } else {
          toast.success("Verification code sent to your phone.");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    if (isNewUser && (!fullname.trim() || !role)) {
      toast.error("Please enter your name and select how you'll use RozgarHub.");
      return;
    }
    try {
      setLoading(true);
      const payload = { phoneNumber: phone, otp };
      if (isNewUser) {
        payload.fullname = fullname;
        payload.role = role;
      }
      const res = await api.post(`${AUTH_API_END_POINT}/otp/verify`, payload);
      if (res.data.success) {
        const user = res.data.data.user;
        dispatch(setUser(user));
        toast.success(res.data.message);
        navigate(user.role === "employer" ? "/admin/companies" : "/jobs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "phone") {
    return (
      <form onSubmit={requestOtp} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("auth.mobileNumber")}</Label>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <span className="text-sm text-muted-foreground">+91</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="98765 43210"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("auth.sendingCode")}
            </>
          ) : (
            t("auth.sendCode")
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp} className="space-y-5">
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("auth.changeNumber")}
      </button>

      <div className="space-y-1.5">
        <Label htmlFor="otp">{t("auth.enterCode", { phone })}</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className="text-center text-lg tracking-[0.5em]"
        />
      </div>

      {isNewUser && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="otp-fullname">{t("auth.yourName")}</Label>
            <Input
              id="otp-fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Ramesh Kumar"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("auth.howUse")}</Label>
            <RoleSelector value={role} onChange={setRole} />
          </div>
        </>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            {t("auth.verifying")}
          </>
        ) : isNewUser ? (
          t("auth.createAccount")
        ) : (
          t("auth.login")
        )}
      </Button>
    </form>
  );
}

export default PhoneOtpForm;
