function generateDays() {
    const daysContainer = document.getElementById('days-container');
    daysContainer.innerHTML = ''; // Limpa os dias anteriores
    const month = document.getElementById('month').value;
    if (!month) {
        alert('Por favor, selecione um mês.');
        return;
    }

    const [year, monthNumber] = month.split('-');
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNumber - 1, day);
        const dayOfWeek = weekdays[date.getDay()];

        const start1 = document.getElementById(`start1-${dayOfWeek}`)?.value || '';
        const end1 = document.getElementById(`end1-${dayOfWeek}`)?.value || '';
        const start2 = document.getElementById(`start2-${dayOfWeek}`)?.value || '';
        const end2 = document.getElementById(`end2-${dayOfWeek}`)?.value || '';
        const repeat = document.getElementById(`repeat-${dayOfWeek}`)?.checked;

        const dayRow = document.createElement('tr');
        dayRow.innerHTML = `
            <td>${day}/${monthNumber}/${year}</td>
            <td>${dayOfWeek}</td>
            <td><input type="time" id="start1-${day}" value="${repeat ? start1 : ''}"></td>
            <td><input type="time" id="end1-${day}" value="${repeat ? end1 : ''}"></td>
            <td><input type="time" id="start2-${day}" value="${repeat ? start2 : ''}"></td>
            <td><input type="time" id="end2-${day}" value="${repeat ? end2 : ''}"></td>
            <td><input type="checkbox" id="holiday-${day}"></td>
        `;
        daysContainer.appendChild(dayRow);
    }
}

function calculateOvertime() {
    const salary = parseFloat(document.getElementById('salary').value);
    const daysContainer = document.getElementById('days-container');
    const dayRows = daysContainer.getElementsByTagName('tr');
    const weeklyHoursLimit = 44;
    const monthlyWeeks = 4.33; // Média de semanas por mês

    if (isNaN(salary) || dayRows.length === 0) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const hourlyRate = salary / (weeklyHoursLimit * monthlyWeeks); // Calcula a taxa por hora
    let totalHours = 0;
    let specialHours = 0;
    let overtimeHours = 0;
    let weekHours = 0; // Controle semanal de horas

    for (let i = 0; i < dayRows.length; i++) {
        const dayRow = dayRows[i];
        const cells = dayRow.getElementsByTagName('td');
        const dateParts = cells[0].innerText.split('/');
        const dayOfWeek = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`).getDay();

        const start1 = cells[2].getElementsByTagName('input')[0]?.value || '';
        const end1 = cells[3].getElementsByTagName('input')[0]?.value || '';
        const start2 = cells[4].getElementsByTagName('input')[0]?.value || '';
        const end2 = cells[5].getElementsByTagName('input')[0]?.value || '';
        const isHoliday = cells[6].getElementsByTagName('input')[0]?.checked;

        let hours = calculateHours(start1, end1) + calculateHours(start2, end2);

        if (isHoliday || dayOfWeek === 0) { // 0 = domingo
            specialHours += hours;
        } else if (dayOfWeek === 6 && start2 >= '12:00') { // 6 = sábado
            specialHours += hours;
        } else {
            totalHours += hours;
            weekHours += hours;
        }

        // Calcular horas extras semanalmente
        if (weekHours > weeklyHoursLimit) {
            overtimeHours += weekHours - weeklyHoursLimit;
            weekHours = weeklyHoursLimit; // Resetar semana
        }

        // Resetar contagem semanal a cada domingo
        if (dayOfWeek === 0) {
            weekHours = 0;
        }
    }

    let regularPay = totalHours * hourlyRate;
    let overtimePay = overtimeHours * (hourlyRate * 1.5);
    let specialPay = specialHours * (hourlyRate * 2);
    let totalPay = regularPay + overtimePay + specialPay;

    document.getElementById('result').innerHTML = `
        <p>Salário Base: R$ ${salary.toFixed(2)}</p>
        <p>Horas Extras: R$ ${overtimePay.toFixed(2)}</p>
        <p>Horas Especiais: R$ ${specialPay.toFixed(2)}</p>
        <p>Pagamento Total: R$ ${totalPay.toFixed(2)}</p>
    `;
}

function calculateHours(start, end) {
    if (!start || !end) return 0;
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const difference = (endTime - startTime) / (1000 * 60 * 60);
    return difference;
}
