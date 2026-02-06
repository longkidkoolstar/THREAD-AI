export default (req, res) => {
    res.status(200).json({
        message: 'Sanity Check Passed (Pure JS)',
        timestamp: Date.now()
    });
};
