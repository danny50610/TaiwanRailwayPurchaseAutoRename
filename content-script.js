/**
 * <form action="/tra-tip-web/tip/tip001/tip115/purchaseDownload/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" method="post">
*       <input type="hidden" name="_csrf" value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
        <input type="hidden" name="pid" value="XXXX">
        <input type="hidden" name="recNo" value="XXXXX">
        <button type="submit" title="下載購票證明">下載購票證明</button>
    </form>
 */

function findMatchingYears(month, day, targetWeekday) {
    const now = new Date();
    const currentYear = now.getFullYear();

    for (let year = currentYear; year >= currentYear - 3; year--) {
        const date = new Date(year, month - 1, day); // JS 月份從 0 開始
        const weekday = date.getDay(); // 0=Sunday, 6=Saturday

        if (weekday === targetWeekday) {
           return year;
        }
    }

    return null;
}

function weekdayTextToNumber(weekdayText) {
    const map = {
        '星期日': 0,
        '星期一': 1,
        '星期二': 2,
        '星期三': 3,
        '星期四': 4,
        '星期五': 5,
        '星期六': 6
    };
    return map[weekdayText] ?? null;
}

function extractDateRoute(table) {
    const dateElem = table.querySelector('.time-course .date');
    const fromElem = table.querySelector('.time-course .from');
    const toElem = table.querySelector('.time-course .to');

    if (!dateElem || !fromElem || !toElem) return null;

    // 擷取日期與星期
    const dateText = dateElem.textContent.trim(); // e.g. "12/02(星期一)"
    const match = dateText.match(/^(\d{2})\/(\d{2})\((星期[一二三四五六日])\)$/);

    if (!match) return null;

    const [, month, day, weekday] = match;
    const year = findMatchingYears(month, day, weekdayTextToNumber(weekday)); // 可能是 null

    const route = `${fromElem.textContent.trim()}-${toElem.textContent.trim()}`;
    const dateStr = year ? `${year}-${month}-${day}` : `${month}-${day}`;

    return `${dateStr} ${route}`;
}


(() => {
    const target = Array.from(document.querySelectorAll('button[type="submit"]')).find(el =>
        el.textContent?.trim().includes('下載購票證明')
    );

    if (!target) {
        console.log('找不到表單元素');
        return;
    }

    const form = target.closest('form');
    if (!form) {
        console.log('找不到表單元素');
        return;
    }

    const ths = Array.from(document.querySelectorAll('th'));
    const targetTh = ths.find(th => th.textContent?.includes('旅程'));

    if (!targetTh) {
        console.log('找不到旅程元素');
        return;
    }

    const table = targetTh.closest('table');
    if (!table) {
        console.log('找不到旅程表格元素');
        return;
    }

    const filename = extractDateRoute(table);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
        });

        if (!response.ok) {
            alert('下載失敗，請關閉擴充功能後再嘗試一次');
            return;
        }

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    });
})();
