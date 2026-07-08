import { useState } from "react";
import { authAPI } from "../api";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaApple, FaGoogle } from "react-icons/fa";
import toast from "react-hot-toast";
import "./SignUp.css";
import { BiFontFamily } from "react-icons/bi";

function SignUp({ setLoggedIn, setAuthPage, setUserData }) {
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await authAPI.signup(fullName, email, password, userName, businessName);
            localStorage.setItem("authToken", result.authToken);

            const res = await authAPI.me();
            const user = res?.user || res;
            setUserData(user);
            setLoggedIn(true);
        } catch (err) {
            console.error(err.message);
            setError("حدث خطأ أثناء إنشاء الحساب: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        toast(`تسجيل الدخول عبر ${provider} قريباً`);
    };

    return (
        <div className="login-page">
            {/* اللوحة اليمنى: فورم إنشاء الحساب */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <div className="login-logo">
                        <img src="/Logo.png" alt="Tijara Logo" className="login-logo-image" />
                    </div>

                    <h1 className="login-headline" style={{ fontFamily: "Cairo, sans-serif" }}>
                        ابدأ في إدارة أعمالك،<br />
                       
                    </h1>

                    <p className="login-subtext" style={{ fontFamily: "Cairo, sans-serif" }}>

                        أنشئ حسابك وابدأ في متابعة مبيعاتك ومخزونك ومصروفاتك في مكان واحد.
                    </p>

                    <div className="social-buttons-row">
                        <button
                            type="button"
                            className="social-button"
                            onClick={() => handleSocialLogin("Apple")}
                        >
                            <FaApple /> آبل
                        </button>
                        <button
                            type="button"
                            className="social-button"
                            onClick={() => handleSocialLogin("جوجل")}
                        >
                            <FaGoogle /> جوجل
                        </button>
                    </div>

                    <div className="divider-row">
                        <span className="divider-line" />
                        <span className="divider-label">أو</span>
                        <span className="divider-line" />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <form onSubmit={handleSignUp}>
                        <div className="field-group">
                            <label htmlFor="fullName">الاسم الكامل</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="fullName"
                                    placeholder="اسمك الكامل"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                                <CiUser className="field-icon" />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="userName">اسم المستخدم</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="userName"
                                    placeholder="@username"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value.toLowerCase().replace(/\s/g, ""))}
                                    required
                                />
                                <CiUser className="field-icon" />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="businessName">اسم العمل</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="businessName"
                                    placeholder="اسم عملك"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                />
                                <CiUser className="field-icon" />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <div className="input-with-icon">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <CiMail className="field-icon" />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="password">كلمة المرور</label>
                            <div className="input-with-icon">
                                <button
                                    type="button"
                                    className="eye-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </button>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <CiLock className="field-icon" />
                            </div>
                        </div>

                        <button type="submit" className="login-submit" disabled={isLoading}>
                            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                        </button>
                    </form>

                    <button className="signup-link" onClick={() => setAuthPage("login")}>
                        لديك حساب بالفعل؟ <span>تسجيل الدخول</span>
                    </button>
                </div>
            </div>

            {/* اللوحة اليسرى: معاينة الداشبورد */}
            <div className="container">
                <div className="login-preview-panel">
                    <div className="preview-glow glow-1" />
                    <div className="preview-glow glow-2" />
                    <div className="preview-glow glow-3" />
                    <div className="preview-arc" />

                    <div className="preview-card">
                        <div className="preview-stats-row">
                            <div className="preview-stat-box">
                                <span className="preview-stat-label">طلبات اليوم</span>
                                <span className="preview-stat-value">482</span>
                            </div>
                            <div className="preview-stat-box">
                                <span className="preview-stat-label">إجمالي المخزون</span>
                                <span className="preview-stat-value">2,745</span>
                            </div>

                            <div className="preview-list">
                                <div className="preview-list-row">
                                    <span className="preview-list-label">إيراد اليوم</span>
                                    <span className="preview-list-value green">245,000 ج</span>
                                </div>
                                <div className="preview-list-row">
                                    <span className="preview-list-label">نسبة الربح</span>
                                    <span className="preview-list-value green">96.7%</span>
                                </div>
                                <div className="preview-list-row">
                                    <span className="preview-list-label">منتجات قليلة</span>
                                    <span className="preview-list-value orange">2 منتج</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;