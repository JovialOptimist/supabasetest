// A basic React app that uses Supabase for authentication and to manage a variable (the user's number of coins).
import './App.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

// The client to call supabase functions from
// Uses the public URL and anon key from the Supabase project
const supabase = createClient('https://bbwrqqjorwjxlsizxdfx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJid3JxcWpvcndqeGxzaXp4ZGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjIzMTUsImV4cCI6MjA2NDEzODMxNX0.3v_v8R4xugHY3iSunJgDC2T_fJBGUMD-03eImFTL9oU')

export default function App() {
    const [session, setSession] = useState(null);
    const [coins, setCoins] = useState(null);

    // Fetches the number of coins for the user
    // There's a supabase function called `get_user_coins` that takes a user_id and returns the number of coins
    const fetchCoins = async (userId) => {
        const { data, error } = await supabase.rpc('get_user_coins', { user_id: userId });
        if (error) {
            console.error('Error fetching coins:', error);
        } else {
            setCoins(data);
        }
    };

    // Whenever the button is clicked, this function is called
    // It calls the supabase function `increment_user_coins` which increments the user's coins by 1
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

    // This effect runs once when the component mounts
    // It checks if the user is already logged in and fetches their coins
    // It also sets up a listener for authentication state changes
    // If the user logs in or out, it updates the session and fetches coins accordingly
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

    // If the user is not logged in, show the authentication UI
    if (!session) {
        return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />);
    }
    // Otherwise, if the user is logged in:
    // show their coins and a button to increment them
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