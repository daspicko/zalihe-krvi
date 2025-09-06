import dotenv from 'dotenv'
import fetch from 'node-fetch'
dotenv.config();

const sendNotification = async (locationId, bloodType) => {
    return await fetch(`${process.env.BE_HOST}/send`, {
        method: 'POST',
        headers: {
            'x-api-key': process.env.BE_X_API_KEY
        },
        body: JSON.stringify({
            locationId,
            bloodType
        })
    });
}

const response = await fetch(`${process.env.FE_HOST}/data.json`);

if (response.ok) {
    const data = await response.json();
    const locations = data.locations;

    // Send notifications
    for (const location of locations) {
        for (const group of location.bloodGroups) {
            if (group.amountPercentage < group.lowPercentage) {
                const sendNotificationResponse = await sendNotification(location.id, group.type);
                if (sendNotificationResponse.ok) {
                    console.log(`Notification request accepted for location ${location.name} and blood type ${group.type}`);
                } else {
                    console.error(`Failed to send notification for location ${location.name} and blood type ${group.type}: ${sendNotificationResponse.status} ${sendNotificationResponse.statusText}`);
                }
            }
        }
    }
} else {
    console.error(`Failed to fetch data: ${response.statusText}`);
    process.exit(1);
}
