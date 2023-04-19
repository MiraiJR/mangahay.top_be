<h1> Dự án đọc truyện </h1>
<h2> Mô tả </h2>
<li> Dự án là back-end cho một website đọc truyện. Cung cấp API cho FE sử dụng. Mã nguồn vẫn còn đang trong quá trình hoàn thiện.</li>
<h2> Số lượng thành viên: 1 </h2>
<li> Trương Văn Hào</li>
<h2> Ngôn ngữ sử dụng trong dự án </h2>
<li> Môi trường thực thi NodeJS </li>
<li> Framework: NestJS </li>
<li> Ngôn ngữ: JavaScript, TypeScript, python (sở dĩ có thêm python vì dùng python để crawl dữ liệu tự động)</li>
<li> Database: Postgres </li>
<li> Cache: Redis </li>
<h2> Các chức năng của dự án </h2>
<h3> CRUD </h3>
<li> CRUD cho các đối tượng Comic, Chapter, Comment, Notification, ... </li>
<h3> Đăng nhập, đăng ký, quên mật khẩu, đăng xuất </h3>
<li> Dùng JWT để tạo các token cần thiết như accesstoken, refreshtoken, ... </li>
<li> Nodemailer để gửi mail OTP code xác thực đăng ký (OTP tồn tại trong 5 phút) + dùng redis để quản lý OTP này (vì redis có ttl tự hủy token trong list khi expired time), OTP này là Link đính token</li>
<li> Ngoài ra ở đây, khi user đăng xuất thì các token vẫn còn ttl sẽ được lưu vào block list trên redis ngăn việc hacker bắt được token của user vẫn truy cập được </li>
<h3> Tự động cập nhật chapter, comic mỗi 1 giờ </h3> 
<li> Dùng python cho việc crawl data từ một website khác </li>
<li> Dùng child_process để kết nối + cron, schedule để tạo lệnh automatic mỗi 1 giờ </li>
<h3> Thông báo </h3>
<li> Sử dụng socket.io làm thông báo realtime đến user nếu user đang truy cập website. Socket.id sẽ được lưu trữ trên redis </li>
<h3> Chat </h3>
<li> Sử dụng socket.io để làm chat realtime + thông báo tin mới đến user khi user đã login và đang truy cập website </li>
<h3 style="color:blue;"> Tích hợp query language Graphql + ApolloServer</h3>
<li> Đang thực hiện </li>

<h3> vẫn còn đang cập nhật ... </h3>
<h3> Tương tác với database </h3>
<li> Dùng TypeOrm để tương tác + các decorator Entity </li>

<h2> Thực thi code </h2>
<li>Môi trường dev: npm run start:dev </li>
<li>Môi trường product: npm run start </li>

<h2> Yêu cầu khác </h2>
<li> Phải khởi chạy redis ở port: 6739 </li>
