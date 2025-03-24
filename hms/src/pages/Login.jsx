import { useState } from 'react';
import './Logincss.css';

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div className='login-page'>
            <div className='backimage'></div>
            <div className={`lgcontainer ${isRegister ? 'lgslide-in' : 'lgslide-out'}`}>
                <h2>{isRegister ? 'Register' : 'Log In'}</h2>
                
                {isRegister ? (
                    // Registration Form
                    <form>
                        <input type="text" placeholder="Username" required />
                        <input type="text" placeholder="Full Name" required />
                        <input type="password" placeholder="Password" required />
                        <input type="text" placeholder="Phone Number" required />
                        <input type="email" placeholder="Email" required />
                        <select required>
                            <option value="">Select User Type</option>
                            <option value="Guest">Student</option>
                            <option value="Hotel Manager">Staff</option>
                        </select>
                        <button type="submit">Register</button>
                    </form>
                ) : (
                    // Login Form
                    <form>
                        <input type="text" placeholder="Enter Username" required />
                        <input type="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                    </form>
                )}
                
                <p>
                    {isRegister ? (
                        <>
                            Already have an account?{' '}
                            <a href="#" onClick={() => setIsRegister(false)}>Log in</a>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <a href="#" onClick={() => setIsRegister(true)}>Register</a>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default Login;
