const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fohcutrrhrihvzrvynxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaGN1dHJyaHJpaHZ6cnZ5bnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjc2MzUsImV4cCI6MjA4ODY0MzYzNX0.IqPHkCuaP-ohUH_JlF-zyXjR1wInXDplzmBj0upfxoo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = ['profiles', 'jobs', 'applications', 'experiences', 'chat_rooms', 'messages', 'business_sectors'];

async function inspectDatabase() {
  console.log('==================================================');
  console.log('  OBSIDIAN / APTLY DATABASE TABLES INSPECTOR      ');
  console.log('==================================================');
  console.log(`Connecting to: ${supabaseUrl}\n`);

  for (const tableName of TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`[-] Tabla [${tableName}]: Error o no accesible (${error.message})`);
      } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        console.log(`[+] Tabla [${tableName}]: ¡CONECTADA Y ACCESIBLE!`);
        if (columns.length > 0) {
          console.log(`    - Columnas detectadas: ${columns.join(', ')}`);
          console.log(`    - Estado: Contiene datos (${data.length} registros muestreados)`);
        } else {
          console.log(`    - Estado: Vacía (sin registros para inferir columnas en este momento)`);
        }
      }
    } catch (err) {
      console.log(`[-] Tabla [${tableName}]: Excepción durante inspección (${err.message})`);
    }
    console.log('--------------------------------------------------');
  }
}

inspectDatabase();
