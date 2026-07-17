import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_API_END_POINT } from "@/utils/constant";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2, Phone, Mail } from "lucide-react";
import { AuthLayout, RoleSelector, PasswordInput } from "./AuthLayout";
import PhoneOtpForm from "./PhoneOtpForm";
import { useI18n } from "@/i18n/I18nProvider";

function Login() {
  // Phone is the default path — it's the primary way this audience signs in.
  const [method, setMethod] = useState("phone"); // 'phone' | 'email'
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error(t("auth.selectRole"));
      return;
    }
    try {
      dispatch(setLoading(true));
      const res = await api.post(`${AUTH_API_END_POINT}/login`, input);
      if (res.data.success) {
        const loggedInUser = res.data.data.user;
        dispatch(setUser(loggedInUser));
        // Land users where their work is, not on the marketing page
        navigate(loggedInUser.role === "employer" ? "/admin/companies" : "/jobs");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || t("auth.genericError"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate(user.role === "employer" ? "/admin/companies" : "/jobs");
    }
  }, [user, navigate]);

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      subtitle={t("auth.loginSubtitle")}
    >
      {/* Method toggle */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            method === "phone"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {t("auth.phoneOtp")}
        </button>
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            method === "email"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {t("auth.email")}
        </button>
      </div>

      {method === "phone" ? (
        <PhoneOtpForm />
      ) : (
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleSelector
          value={input.role}
          onChange={(role) => setInput({ ...input, role })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="login-username">{t("auth.username")}</Label>
          <Input
            id="login-username"
            value={input.username}
            name="username"
            onChange={changeEventHandler}
            type="text"
            autoComplete="username"
            placeholder="yourusername"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-email">{t("auth.email")}</Label>
          <Input
            id="login-email"
            value={input.email}
            name="email"
            onChange={changeEventHandler}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">{t("auth.password")}</Label>
          <PasswordInput
            id="login-password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder={t("auth.yourPassword")}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("auth.loggingIn")}
            </>
          ) : (
            t("auth.logIn")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            {t("auth.signupFree")}
          </Link>
        </p>
      </form>
      )}
    </AuthLayout>
  );
}

export default Login;
