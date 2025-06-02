import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient('https://bbwrqqjorwjxlsizxdfx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJid3JxcWpvcndqeGxzaXp4ZGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjIzMTUsImV4cCI6MjA2NDEzODMxNX0.3v_v8R4xugHY3iSunJgDC2T_fJBGUMD-03eImFTL9oU')

export default function App() {
    const [session, setSession] = useState(null);
    const [coins, setCoins] = useState(null);

    
    const fetchCoins = async (userId) => {
        const { data, error } = await supabase.rpc('get_user_coins', { user_id: userId });
        if (error) {
            console.error('Error fetching coins:', error);
        } else {
            setCoins(data);
        }
    };

    const handleClick = async () => {
        const { data, error } = await supabase
            .rpc('increment_user_coins', { user_id: session.user.id });

        if (error) {
            console.error('Error incrementing coins:', error);
        } else {
            console.log('New coin count:', data);
            setCoins(data);
        }
    };

    
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchCoins(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchCoins(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!session) {
        return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />);
    }
    else {
        return (
            <div>
                <p>Logged in! Welcome, {session.user.email}</p>
                <p>
                    {coins === null ? "Loading coins..." : `You have ${coins} coins!`}
                </p>
                <button onClick={handleClick}>Click to increase your coins by one!</button>
                <p>Changes to your coins are saved automatically, even if you close the tab 👍.</p>
            </div>
        );
    }
    
}