const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

document.addEventListener('alpine:init', () => {
    Alpine.data('festivalProgram', () => ({
        groupedEvents: {},
        festivalDates: "",
        loading: true,
        error: null,
        async init() {
            var SPREADSHEET_PUBLISHED_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtiL8jwMmKlR3_mWq0pXKGiPd_Z8c66MpuLE2zwGNGJrZZUUTnJLl-zJEbuZ7mw8SJqbA_HOaxV-tj/pub?output=csv";

            const CACHE_KEY = 'festivalProgram';
            const CACHE_TIMESTAMP_KEY = 'festivalProgramTimestamp';
            const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

            try {
                // Try to load cached data
                const cached = localStorage.getItem(CACHE_KEY);
                const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

                // Make sure there is data and it's not expired
                if (cached && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_MAX_AGE)) {
                    const parsedData = JSON.parse(cached);
                    this.groupedEvents = parsedData.groupedEvents;
                    this.festivalDates = parsedData.festivalDates;
                    this.loading = false;
                    return;
                }

                // Fetch fresh festival data with Papa Parse
                Papa.parse(SPREADSHEET_PUBLISHED_URL, {
                    download: true,
                    header: true,
                    complete: (results) => {
                        // Remove rows with an empty date
                        const data = results.data.filter(item => item.Date && item.Date.trim() !== "");

                        /**
                         * Create sorted object with events grouped by date
                         **/

                        function parseDate(str) {
                            const [dd, mm, yy] = str.split('/').map(Number);
                            return new Date(2000 + yy, mm - 1, dd);
                        }

                        // Sort ascending by date
                        data.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));

                        // Group by date
                        const groupedEvents = data.reduce((acc, item) => {
                            const itemDate = item.Date;

                            // Add date groupe if it doesn't exist
                            if (!acc[itemDate]) {
                                acc[itemDate] = [];
                            }

                            // Add item to its corresponding date group
                            acc[itemDate].push(item);

                            return acc;
                        }, {});

                        // Sort ascending by time
                        for (const date in groupedEvents) {
                            groupedEvents[date].sort((a, b) => {
                                const [ah, am] = a.Heure.split(':').map(Number);
                                const [bh, bm] = b.Heure.split(':').map(Number);
                                return ah === bh ? am - bm : ah - bh;
                            });
                        }

                        /**
                         * Create string of festival dates based of date groups
                         **/

                        const dates = [...new Set(data.map(item => item.Date))];
                        const festivalDates = this.getFestivalDates(dates);

                        // Update state
                        this.groupedEvents = groupedEvents;
                        this.festivalDates = festivalDates;

                        // 3. Save to cache
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            groupedEvents,
                            festivalDates
                        }));
                        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now());
                        this.loading = false;
                    },
                    error: (err) => {
                        this.error = err.message;
                        this.loading = false;
                    }
                })
            } catch (e) {
                console.warn("Cache parse error", e);
                this.error = e.message
                this.loading = false
            }
        },
        getFestivalDates: (rawDates) => {
            const [date1, date2] = rawDates;
            const [d1, m1] = date1.split("/").map(Number);
            const [d2, m2] = date2.split("/").map(Number);
            const month = MONTHS[m1 - 1];
            return `${d1} · ${d2} ${month}`;
        },
        formatProgrammationDate: (rawDate) => {
            // Split on "/"
            const parts = rawDate.split("/");

            // Take the required parts from [day, month, year]
            const dateNumber = Number(parts[0]);
            const dateMonth = MONTHS[Number(parts[1]) - 1].toUpperCase();

            return `${dateNumber} ${dateMonth}`;
        },
        formatTime: (rawTime) => {
            // Replace ":" with "h"
            return rawTime.replace(":", "h");
        }
    }))
})