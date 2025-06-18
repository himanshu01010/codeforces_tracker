let settings ={
    cronSchedule: '0 2 * * *',
    emailEnabled: true,
    inactivityDays: 7
};

export const getSettings = (req,res)=>{
    res.json(settings);
};

export const updateSettings = (req,res)=>{
    try{
        const {cronSchedule, emailEnabled , inactivityDays} = req.body;

        if(cronSchedule) settings.cronSchedule = cronSchedule;
        if(emailEnabled !== undefined) settings.emailEnabled=emailEnabled;
        if(inactivityDays) settings.inactivityDays = inactivityDays;

        res.json({message: 'Settings updated successfully', settings});
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
}