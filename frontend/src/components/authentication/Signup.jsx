import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_API_END_POINT } from "@/utils/constant.js";
import { toast } from "sonner";
import api from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2, ImagePlus } from "lucide-react";
import { AuthLayout, RoleSelector, EmployerTypeSelector, PasswordInput } from "./AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

function Signup() {
  const [input, setInput] = useState({
    username: "",
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    employerType: "individual",
    file: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);
  const { lang, t } = useI18n();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) {
      toast.error(t("auth.selectRole"));
      return;
    }
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("username", input.username);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    if (input.role === "employer") {
      formData.append("employerType", input.employerType);
    }
    formData.append("language", lang);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      dispatch(setLoading(true));
      const res = await api.post(`${AUTH_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error, "ERROR IN SIGNUP PAGE");
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
      title={t("auth.signupTitle")}
      subtitle={t("auth.signupSubtitle")}
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleSelector
          value={input.role}
          onChange={(role) => setInput({ ...input, role })}
        />

        {input.role === "employer" && (
          <EmployerTypeSelector
            value={input.employerType}
            onChange={(employerType) => setInput({ ...input, employerType })}
          />
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-fullname">{t("auth.fullName")}</Label>
            <Input
              id="signup-fullname"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              type="text"
              autoComplete="name"
              placeholder="Ramesh Kumar"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-username">{t("auth.username")}</Label>
            <Input
              id="signup-username"
              value={input.username}
              name="username"
              onChange={changeEventHandler}
              type="text"
              autoComplete="username"
              placeholder="rameshk"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">{t("auth.email")}</Label>
            <Input
              id="signup-email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-phone">{t("auth.phone")}</Label>
            <Input
              id="signup-phone"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              type="tel"
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{t("auth.password")}</Label>
          <PasswordInput
            id="signup-password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder={t("auth.passwordHint")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-photo" className="flex items-center gap-1.5">
            <ImagePlus className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t("auth.profilePhoto")} <span className="font-normal text-muted-foreground">{t("auth.optional")}</span>
          </Label>
          <Input
            id="signup-photo"
            onChange={changeFileHandler}
            accept="image/*"
            type="file"
            className="cursor-pointer file:mr-3 file:font-medium file:text-foreground"
          />
          {input.file && (
            <p className="text-xs text-muted-foreground">{t("auth.selectedFile", { name: input.file.name })}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("auth.creating")}
            </>
          ) : (
            t("auth.createAccount")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t("auth.logIn")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
