import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import { doc, setDoc } from "firebase/firestore";
import "./SignUp.css";

function SignUp({ setLoggedIn, setAuthPage }) {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [error, setError] = useState("");
 
    // Function to handle sign up with email and password
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("تم إنشاء الحساب بنجاح:", userCredential.user);

            await setDoc(doc(db, "users", userCredential.user.uid), {
                fullName: fullName,
                businessName: businessName,
                email: email,
                createdAt: new Date(),
            });

            setLoggedIn(true);

        } catch (err) {
            console.error(err.message);
            setError("حدث خطأ أثناء إنشاء الحساب: " + err.message);
        }
    };

    // Function to handle sign in with Google
    const handleGoogleSignIn = async () => {
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("تم تسجيل الدخول بجوجل:", result.user);
            setLoggedIn(true);
        } catch (err) {
            console.error(err.message);
            setError("حدث خطأ أثناء تسجيل الدخول بجوجل: " + err.message);
        }
    };

    return (
        <div className="signup-container">
            <h1>إنشاء حساب</h1>
            <p>ابدأ في إدارة أعمالك بسهولة وسرعة</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSignUp}>
                <div>
                    <label htmlFor="fullName">الاسم الكامل</label>
                    <div className="input-with-icon">
                        <CiUser />
                        <input
                            type="text"
                            id="fullName"
                            placeholder="اسمك الكامل"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email">البريد الإلكتروني</label>
                    <div className="input-with-icon">
                        <CiMail />
                        <input
                            type="email"
                            id="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password">كلمة المرور</label>
                    <div className="input-with-icon">
                        <CiLock />
                        <input
                            type="password"
                            id="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="businessName">اسم العمل</label>
                    <div className="input-with-icon">
                        <CiUser />
                        <input
                            type="text"
                            id="businessName"
                            placeholder="اسم عملك"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit">إنشاء حساب</button>
            </form>

            <button type="button" onClick={handleGoogleSignIn} className="google-btn">
                تسجيل الدخول بجوجل
            </button>

            {/* زرار الانتقال لصفحة اللوج إن */}
            <button onClick={() => setAuthPage('login')} style={{ marginTop: "20px" }}>
                لديك حساب؟ تسجيل الدخول
            </button>
        </div>
    );
}

export default SignUp;