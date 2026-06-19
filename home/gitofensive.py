import requests
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
USERNAME = os.getenv("GITHUB_USERNAME") or os.getenv("USERNAME")

def fetch_contribution_calendar(username, token):
    url = "https://api.github.com/graphql"
    headers = {"Authorization": f"Bearer {token}"}
    
    # GraphQL query targeting only the contributionCalendar object
    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
    """
    
    variables = {"login": username}
    response = requests.post(url, json={"query": query, "variables": variables}, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with status code {response.status_code}: {response.text}")

def calculate_streaks(data):
    weeks = data['data']['user']['contributionsCollection']['contributionCalendar']['weeks']
    
    # Flatten the weeks/days structure into a chronological list of days
    chronological_days = []
    for week in weeks:
        for day in week['contributionDays']:
            chronological_days.append(day)
            
    # Sort by date just to ensure strict linear order
    chronological_days.sort(key=lambda x: x['date'])
    
    max_streak = 0
    current_streak = 0
    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    for day in chronological_days:
        count = day['contributionCount']
        date_str = day['date']
        
        # If we are evaluating future dates in the calendar year, break early
        if date_str > today_str:
            break
            
        if count > 0:
            current_streak += 1
            if current_streak > max_streak:
                max_streak = current_streak
        else:
            # If the missing commit is exactly today, the streak might still be active 
            # if the developer hasn't committed *yet* today, but was active yesterday.
            if date_str == today_str:
                continue
            current_streak = 0
            
    return current_streak, max_streak

if __name__ == "__main__":
    try:
        # 1. Fetch raw data
        raw_data = fetch_contribution_calendar(USERNAME, GITHUB_TOKEN)
        
        # 2. Safety Check: Verify if GitHub returned an API error array
        if 'errors' in raw_data:
            print("❌ GitHub API Error Details:")
            for error in raw_data['errors']:
                print(f"  - {error.get('message')}")
            print("\nAction Required: Check your USERNAME or TOKEN permissions.")
            
        # 3. Safety Check: Verify if the user profile actually exists
        elif raw_data.get('data', {}).get('user') is None:
            print(f"❌ Error: The username '{USERNAME}' was not found on GitHub.")
            print("Action Required: Verify the spelling of your USERNAME variable.")
            
        else:
            # If everything is safe, calculate the telemetry
            current, maximum = calculate_streaks(raw_data)
            print(f"--- Telemetry for {USERNAME} ---")
            print(f"Current Active Streak: {current} days")
            print(f"All-Time Maximum Streak: {maximum} days")
            
    except Exception as e:
        print(f"Execution Error: {e}")