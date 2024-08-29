async function sendMessage() {
    const inputElement = document.getElementById('user-input');
    const userInput = inputElement.value;
    if (!userInput.trim()) return; // Không gửi yêu cầu nếu ô nhập liệu rỗng

    // Hiển thị tin nhắn của người dùng
    displayMessage(userInput, 'user-message');
    inputElement.value = ''; // Xóa ô nhập liệu

    try {
        const action = extractAction(userInput);
        const response = await fetch('https://thehungnguyenctu.pythonanywhere.com/api', { // Đảm bảo đúng URL của server Flask
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'action': action,
                'message': userInput
            })
        });

        const data = await response.json();

        // Kiểm tra status
        if (data.status === 'success') {
            const formattedResponse = formatResponse(action, data);
            // Hiển thị phản hồi của bot
            displayMessage(formattedResponse, 'bot-message');
        } else if (data.status === 'error') {
            displayMessage(`Error: ${data.message}`, 'bot-message');
        } else {
            displayMessage('Unexpected response format.', 'bot-message');
        }
    } catch (error) {
        console.error('Error:', error);
        displayMessage('An error occurred while sending your message.', 'bot-message');
    }
}

function displayMessage(message, className) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.innerHTML = message; // Sử dụng innerHTML để hiển thị các thẻ HTML
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Cuộn đến cuối tin nhắn
}

function extractAction(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    if (normalizedInput.startsWith('login_otp') || normalizedInput.startsWith('login otp')) {
        return 'login_otp';
    } else if (normalizedInput === 'userinfo' || normalizedInput === 'user info') {
        return 'userInfo';
    } else if (normalizedInput === 'cacbon' || normalizedInput === 'carbon') {
        return 'cacbon_balance';
    } else if (normalizedInput === 'credit' || normalizedInput === 'user credit') {
        return 'user_balance';
    } else if (normalizedInput.startsWith('cacbon_to_user') || normalizedInput.startsWith('cacbon to user')) {
        return 'cacbon_to_user';
    } else if (normalizedInput.startsWith('cacbon_to_cacbon') || normalizedInput.startsWith('cacbon to cacbon')) {
        return 'cacbon_to_cacbon';
    } else if (normalizedInput.startsWith('user_to_user') || normalizedInput.startsWith('user to user')) {
        return 'user_to_user';
    } else if (normalizedInput.startsWith('user_to_cacbon') || normalizedInput.startsWith('user to cacbon')) {
        return 'user_to_cacbon';
    } else if (normalizedInput.startsWith('cacbon_to_bank') || normalizedInput.startsWith('cacbon to bank')) {
        return 'cacbon_to_bank';
    } else if (normalizedInput.startsWith('bank_to_cacbon') || normalizedInput.startsWith('bank to cacbon')) {
        return 'bank_to_cacbon';
    } else if (normalizedInput.startsWith('user_to_bank') || normalizedInput.startsWith('user to bank')) {
        return 'user_to_bank';
    } else if (normalizedInput.startsWith('bank_to_user') || normalizedInput.startsWith('bank to user')) {
        return 'bank_to_user';
    } else if (normalizedInput.startsWith('cashback')) {
        return 'promotional_card';
    } else if (normalizedInput.startsWith('atm')) {
        return 'atm_card';
    }else if(normalizedInput === 'help'){
        return 'help';
    }else if (normalizedInput === 'logout') {
        return 'logout';
    }
    return ''; // Trường hợp không tìm thấy action hợp lệ
}
function formatResponse(action, data) {
    let formattedMessage = '';

    switch (action) {
        case 'login_otp':
            if (data && data.message) {
                const message = data.message;
                formattedMessage = `You have logged in successfully<br><b>Your Info</b>:<br>` +
                    `Email: ${message.email}<br>` +
                    `Cacbon Credit Balance: ${message["cacbon balance"]} tín chỉ<br>` +
                    `Credit Balance: ${message["user balance"]} VNĐ`;
            } else {
                formattedMessage = 'Login failed or response data is missing.';
            }
            break;

        case 'userInfo':
            if (data && data.message) {
                const message = data.message;
                formattedMessage = `<b>Your Info</b>:<br>` +
                    `Email: ${message.email}<br>` +
                    `Cacbon Credit Balance: ${message["cacbon balance"]} tín chỉ<br>` +
                    `Credit Balance: ${message["user balance"]} VNĐ`;
            } else {
                formattedMessage = 'User information not available.';
            }
            break;

        case 'cacbon_balance':
            if (data && data.cacbon_credit_balance !== undefined) {
                formattedMessage = `Your Cacbon Credit Balance: ${data.cacbon_credit_balance} tín chỉ`;
            } else {
                formattedMessage = 'Cacbon balance not available.';
            }
            break;

        case 'user_balance':
            if (data && data.user_credit_balance !== undefined) {
                formattedMessage = `Your Credit Balance: ${data.user_credit_balance} VNĐ`;
            } else {
                formattedMessage = 'User balance not available.';
            }
            break;

        case 'cacbon_to_user':
        case 'cacbon_to_cacbon':
        case 'user_to_user':
        case 'user_to_cacbon':
        case 'bank_to_user':
        case 'bank_to_cacbon':
        case 'user_to_bank':
        case 'cacbon_to_bank':
            if (data && data.message && data.data && data.data.message) {
                formattedMessage = `${data.message}<br>` +
                    `Email: ${data.data.message.email}<br>` +
                    `Cacbon Credit Balance: ${data.data.message["cacbon balance"]} tín chỉ<br>` +
                    `Credit Balance: ${data.data.message["user balance"]} VNĐ`;
            } else {
                formattedMessage = 'Transaction details not available.';
            }
            break;

        case 'promotional_card':
            if (data && data["Promotional Card Codes"]) {
                const cashbackCodes = data["Promotional Card Codes"].map(code => `Code: ${code}`).join('<br>');
                formattedMessage = `${cashbackCodes}<br>` +
                    `Email: ${data.data.message.email}<br>` +
                    `Cacbon Credit Balance: ${data.data.message["cacbon balance"]} tín chỉ<br>` +
                    `Credit Balance: ${data.data.message["user balance"]} VNĐ`;
            } else {
                formattedMessage = 'Cashback codes not available.';
            }
            break;

        case 'atm_card':
            if (data && data["ATM Card Codes"]) {
                const atmCodes = data["ATM Card Codes"].map(code => `Code: ${code}`).join('<br>');
                formattedMessage = `${atmCodes}<br>` +
                    `Email: ${data.data.message.email}<br>` +
                    `Cacbon Credit Balance: ${data.data.message["cacbon balance"]} tín chỉ<br>` +
                    `Credit Balance: ${data.data.message["user balance"]} VNĐ`;
            } else {
                formattedMessage = 'ATM codes not available.';
            }
            break;

        case 'help':
            if (data && data.status === 'success') {
                formattedMessage = `Bảng cú pháp lệnh để tương tác với chatbot:<br>` +
                    `1. Để login: gõ login_otp + OTP<br>` +
                    `2. Để xem User Info: gõ userinfo<br>` +
                    `3. Để xem số dư Cacbon Credit: gõ cacbon<br>` +
                    `4. Để xem số dư Credit: gõ credit<br>` +
                    `5. Để chuyển tiền từ credit sang tín chỉ cacbon: gõ user_to_cacbon + Email (người nhận) + amount<br>` +
                    `6. Để chuyển tín chỉ từ cacbon sang tiền bên credit: gõ cacbon_to_user + Email (người nhận) + amount<br>` +
                    `7. Để chuyển tín chỉ cacbon sang user khác: gõ cacbon_to_cacbon + Email (người nhận) + amount<br>` +
                    `8. Để chuyển tiền từ credit sang user khác: gõ user_to_user + Email (người nhận) + amount<br>` +
                    `9. Để chuyển tiền từ ngân hàng sang tín chỉ cacbon: gõ bank_to_cacbon + account number + amount<br>` +
                    `10. Để chuyển tiền từ ngân hàng sang credit: gõ bank_to_user + Email (người nhận) + amount<br>` +
                    `11. Để chuyển tín chỉ cacbon sang tiền ngân hàng: gõ cacbon_to_bank + Email (người nhận) + amount<br>` +
                    `12. Để chuyển tiền từ credit sang ngân hàng: gõ user_to_bank + Email (người nhận) + amount<br>` +
                    `13. Để mua cashback card: gõ cashback + (cacbon/credit) + amount<br>` +
                    `14. Để mua ATM card: gõ ATM + (cacbon/credit) + amount<br>` +
                    `15. Để logout: gõ logout`;
            } else {
                formattedMessage = 'ERROR.';
            }
            break;

        case 'logout':
            if (data && data.status === 'success') {
                formattedMessage = `${data.message}`;
            } else {
                formattedMessage = `${data.message}`;
            }
            break;

        default:
            formattedMessage = 'Unknown action or response format.';
            break;
    }

    return formattedMessage;
}

function handleButtonClick(action) {
    const inputElement = document.getElementById('user-input');
    let command = '';
    switch (action) {
        case 'login':
            inputElement.value = 'login_otp (OTP của bạn)';
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            document.getElementById("txtSearch").value = inputElement.value;
            break;
        case 'userinfo':
            command = 'userinfo';
            break;
        case 'cashback_cacbon':
            inputElement.value = 'cashback cacbon (amount)';
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            document.getElementById("txtSearch").value = inputElement.value;
            break;
        case 'cashback_credit':
            inputElement.value = 'cashback credit (amount)';
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            document.getElementById("txtSearch").value = inputElement.value;
            break;
        case 'atm_cacbon':
            inputElement.value = 'atm cacbon (amount)';
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            document.getElementById("txtSearch").value = inputElement.value;
            break;
        case 'atm_credit':
            inputElement.value = 'atm credit (amount)';
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            document.getElementById("txtSearch").value = inputElement.value;
            break;
        case 'help':
            command = 'help';
            break;
        case 'logout':
            command = 'logout';
            break;
        default:
            return;
    }
    document.getElementById('user-input').value = command;
    sendMessage();
}
