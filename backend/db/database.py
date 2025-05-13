import psycopg2
from datetime import datetime

class LilaDatabase:
    def __init__(self, dbname, user, password, host='localhost', port='5432'):
        self.conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        self.cursor = self.conn.cursor()

    def insert_message(self, role, content, mood):
        query = """
            INSERT INTO daily_moans.lila_chats (role, content, timestamp, mood)
            VALUES (%s, %s, %s, %s);
        """
        self.cursor.execute(query, (role, content, datetime.now(), mood))
        self.conn.commit()

    def fetch_all_messages(self):
        self.cursor.execute("SELECT * FROM daily_moans.lila_chats;")
        return self.cursor.fetchall()
    
    def get_weekly_mood_summary(self):
        query = """
            SELECT mood, COUNT(*) 
            FROM daily_moans.lila_chats
            WHERE timestamp >= NOW() - INTERVAL '7 days'
            GROUP BY mood;
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()


    def close(self):
        self.cursor.close()
        self.conn.close()
