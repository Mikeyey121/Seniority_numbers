import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require'
});

async function updateUnionSeniorityNumbers() {
    try {
        console.log('We are in the seniority number function')
        var seniority_numbers = await sql`
            SELECT * FROM seniority_numbers WHERE seniority_number < 1500
        `;
        console.log(seniority_numbers.length);


        for (let iCount = 0, iSeniority = 1; iCount < seniority_numbers.length; iCount++, iSeniority++) {
            if (seniority_numbers[iCount].seniority_number !== iSeniority) {
                var tempID = seniority_numbers[iCount].id; 
                await sql`
                    UPDATE seniority_numbers SET seniority_number = ${iSeniority} WHERE id = ${tempID}
                `;
            }
        }


    } catch (error) {
        console.error('Error updating seniority numbers:', error);
        throw error;
    }
}

const seniorityNumberUpdate = async () => {
    try {
        // Clear existing data
        await sql`TRUNCATE TABLE seniority_numbers`;
        
        const values = [];
        let id = 1;
        
        // First range: 1-1500
        for (let seniorityNum = 1; seniorityNum <= 1500; seniorityNum += 3) {
            values.push({
                id: id,
                seniority_number: seniorityNum
            });
            id += 2;
        }
        
        // Second range: 3000-3500
        for (let seniorityNum = 3000; seniorityNum <= 3500; seniorityNum += 3) {
            values.push({
                id: id,
                seniority_number: seniorityNum
            });
            id += 2;
        }
        
        // Bulk insert all values
        await sql`
            INSERT INTO seniority_numbers ${
                sql(values, 'id', 'seniority_number')
            }
        `;
        
        console.log('Seniority numbers reset and updated successfully');
    } catch (error) {
        console.error('Error updating seniority numbers:', error);
        throw error;
    }
};

// Execute the function
seniorityNumberUpdate()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });