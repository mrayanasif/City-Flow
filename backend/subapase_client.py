import os
from supabase import create_client, Client
from dotenv import load_dotenv
from models import SensorData
import datetime

load_dotenv()

class SupabaseDB:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.table = os.getenv("SUPABASE_TABLE", "sensor_data")
        
        if not self.url or not self.key:
            raise ValueError("❌ SUPABASE_URL and SUPABASE_KEY must be set in .env")
        
        self.client: Client = create_client(self.url, self.key)
        print(f"✅ Supabase connected to table: {self.table}")
    
    def insert_sensor_data(self, data: SensorData):
        try:
            data_dict = data.dict(exclude_none=True)
            if 'timestamp' not in data_dict or data_dict['timestamp'] is None:
                data_dict['timestamp'] = datetime.datetime.now().isoformat()
            
            response = self.client.table(self.table).insert(data_dict).execute()
            if response.data:
                print(f"✅ Data inserted: {response.data[0]['id']}")
                return response.data[0]
            return None
        except Exception as e:
            print(f"❌ Supabase insert error: {e}")
            return None
    
    def get_latest_data(self, limit: int = 1):
        try:
            response = self.client.table(self.table)\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching latest data: {e}")
            return []
    
    def get_history(self, hours: int = 24):
        try:
            from datetime import datetime, timedelta
            cutoff = datetime.now() - timedelta(hours=hours)
            response = self.client.table(self.table)\
                .select("*")\
                .gte("created_at", cutoff.isoformat())\
                .order("created_at", desc=False)\
                .execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching history: {e}")
            return []

    def get_alerts(self, limit: int = 10):
        try:
            response = self.client.table(self.table)\
                .select("*")\
                .or_("gas_detected.eq.true,motion_detected.eq.true")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching alerts: {e}")
            return []