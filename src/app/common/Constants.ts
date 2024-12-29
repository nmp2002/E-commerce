import { Injectable } from '@angular/core';
import { exportData } from './ExportUtils';

@Injectable({ providedIn: 'root' })
export class Constants {

    static BAOGIA = "BG";
    static HOPDONG = "HĐ";
    static GCN_COMPULSORY = "B";

    static STATUS_CODE_IM_USED = 226;

    static POLICY_STATUS_NEW = "0"; // Chưa chuyển bảo hiểm duyệt
    static POLICY_STATUS_APPROVING = "1"; // Chờ bảo hiểm duyệt
    static POLICY_STATUS_APPROVED = "2"; // Đã duyệt
    static POLICY_STATUS_CANCEL = "3"; // Đã hủy
    static POLICY_STATUS_BACK = "4"; // Đã quay lại

    static NOT_SEND = "0"; // Chưa gửi TMSS
    static SEND_SUCCESS = "1"; // Gửi TMSS thành công
    static SEND_ERROR = "2"; // Gửi TMSS lỗi

    static QUOTA_STATUS_NEW = "0"; // Chưa chuyển bảo hiểm duyệt
    static QUOTA_STATUS_APPROVING = "1"; // Chờ bảo hiểm duyệt
    static QUOTA_STATUS_APPROVED = "2"; // Đã duyệt
    static QUOTA_STATUS_REJECT = "3"; // Đã Từ chối
    static CONTRACTED = "4"; // Đã Chuyển thành Hợp đồng
    static QUOTA_STATUS_CANCEL = "5"; // Đã Hủy
    static NOT_TRANSFER_CONTRACT = "0"; // Chưa chuyển thành hợp đồng
    static TRANSFERED_CONTRACT = "1"; // Đã chuyển thành hợp đồng

    static CONTRACT_STATUS_NEW = "0"; // Chưa chuyển bảo hiểm duyệt
    static CONTRACT_STATUS_APPROVING = "1"; // Chờ bảo hiểm duyệt
    static CONTRACT_STATUS_APPROVED = "2"; // Đã duyệt
    static CONTRACT_STATUS_REJECT = "3"; // Đã hủy
    static CONTRACT_STATUS_CONTRACTED = "4"; // Đã thành Hợp đồng
    static CONTRACT_STATUS_CANCEL = "5"; // Đã hủy
    static CONTRACT_STATUS_CONCLUDE = "6"; // Đã chấm dứt

    static COMPULSORY = "1";// Bắt buộc
    static VOLUNTARY = "2"; // Tự nguyện

    static NOT_PAY = "1"// Khách hàng không thanh toán phí bảo hiểm
    static REQUIRE_CUS_DID = "2"// Khách hàng yêu cầu huỷ đơn + Giấy chứng nhận đã phát sinh bồi thường
    static REQUIRE_CUS_DONT = "3"// Khách hàng yêu cầu huỷ đơn + Giấy chứng nhận chưa phát sinh bồi thường
    static REQUIRE_COMPANY = "4"// Công ty bảo hiểm yêu cầu hủy đơn

    static OFFICETYPE_ALL = "ALL"; // Đại lý
    static OFFICETYPE_G = "G"; // Đại lý
    static OFFICETYPE_B = "B"; // Công ty bảo hiểm
    static OFFICETYPE_Q = "Q"; // Chi nhánh Công ty bảo hiểm

    operator = [
        { key: '=', value: '= (Bằng)', type: '', isdefault: '', tableName: '' },
        { key: '<>', value: '<> (Khác)', type: '', isdefault: '', tableName: '' },
        { key: '>', value: '> (Lớn hơn)', type: '', isdefault: '', tableName: '' },
        { key: '<', value: '< (Nhỏ hơn)', type: '', isdefault: '', tableName: '' },
        { key: '>=', value: '>= (Lớn hơn hoặc bằng)', type: '', isdefault: '', tableName: '' },
        { key: '<=', value: '<= (Nhỏ hơn hoặc bằng)', type: '', isdefault: '', tableName: '' }
    ];

    static TEMPLATE_EXPORT: exportData[] = [
        { id: "1", name: "Báo giá phí bảo hiểm", type: "1" },
        //{ id: "2", name: "Yêu cầu bảo hiểm", type: "2" },
        { id: "3", name: "GCN bảo hiểm", type: "2" },
        { id: "4", name: "GCN bảo hiểm - Sửa đổi bổ sung", type: "2" },
        { id: "10", name: "Bảo Việt", type: "2" },
        { id: "11", name: "PTI", type: "2" },
        { id: "12", name: "PJICO", type: "2" },
        { id: "13", name: "MSIG", type: "2" },
        //{ id: "5", name: "Danh sách phụ kiện đính kèm", type: "2" },
        //{ id: "6", name: "Trách nhiệm dân sự bắt buộc", type: "2" },
        //{ id: "7", name: "Sửa đổi bổ sung", type: "1" },
        //{ id: "8", name: "Yêu cầu hủy đơn", type: "1" },
        //{ id: "9", name: "Yêu cầu sửa đổi bổ sung", type: "1" }
        // { id: "10", name: "(10) Bảo Việt.docx", type: "2" },
        // { id: "11", name: "(11) PTI.docx", type: "2" },
        // { id: "12", name: "(12) PJICO.docx", type: "2" },
        // { id: "13", name: "(13) MSIG.docx", type: "2" },
    ];

    static TEMPLATE_EXPORT_CONTRACT: exportData[] = [
        { id: "1", name: "Hợp đồng bảo hiểm 2 bên - TFS", type: "1" },
        { id: "2", name: "Hợp đồng bảo hiểm 2 bên", type: "2" },
        { id: "3", name: "Hợp đồng bảo hiểm 3 bên", type: "3" }
    ];

    static map_Rule_Action_DATA: any[] = [
        { key: "requireCreateVin", value: "I.1.Bắt buộc Tìm kiếm số khung (Tạo mới hồ sơ khách hàng)" },
        { key: "onlyCreateCustomer", value: "I.2.Không thay đổi tên KH quá nhiều từ API (Tạo mới hồ sơ khách hàng)" },
        { key: "onlyViewCustomer", value: "II.1.Không cập nhật KH quá nhiều trong hệ thống (Chi tiết hồ sơ khách hàng)" },
        { key: "requireViewVin", value: "II.2.Bắt buộc Chọn số khung ở danh sách (Chi tiết hồ sơ khách hàng)" },
        { key: "hideTelCustomer", value: "II.3.Không cho xem thông tin khách hàng (Chi tiết hồ sơ khách hàng)" },
        { key: "onlyQuotadate", value: "III.1.Cho nhập ngày cấp báo giá < Ngày hiện tại (Tạo báo giá)" },
        { key: "onlyQuotadateAddtion", value: "III.2.Cho nhập ngày áp dụng SĐBS <> Ngày hiện tại (Tạo báo giá SDBS)" },
        { key: "onlyRegisterdate", value: "III.3.Cho nhập Ngày đăng ký > Ngày giao xe + 30 ngày (Tạo báo giá)" },
        { key: "requireEfftivedate", value: "IV.1.Cho nhập Ngày giờ hiệu lực bắt đầu < Ngày giờ cấp báo giá gốc (Thêm GCN)" },
        { key: "requireEffivedateAddtion", value: "IV.2.Cho nhập Ngày giờ hiệu lực bắt đầu <> Ngày giờ hiệu lực bắt đầu của GCN trước (Thêm GCN SDBS)" },
        { key: "onlyFeerate", value: "IV.3.Cho điều chỉnh Tỷ lệ phí / Phí bảo hiểm của 1 nghiệp vụ thấp hơn Tỷ lệ phí / Phí bảo hiểm tính toán mặc định (Thêm GCN)" },
        { key: "requireThreeMonth", value: "IV.4.Cho nhập ngày hiệu lực bắt đầu GCN > Ngày cấp báo giá + 3 tháng" },
        { key: "hideTelContract", value: "V.1.Không cho xem thông tin khách hàng (Hợp đồng)" },
        { key: "hideTelQuota", value: "V.2.Không cho xem thông tin khách hàng (Báo giá)" },
        { key: "hideTelGCN", value: "V.3.Không cho xem thông tin khách hàng (GCN)" },
        { key: "requireContractdate", value: "VI.Cho nhập ngày giờ H.Đ < Ngày giờ hiện tại (Thêm mới hợp đồng)" },
        { key: "requireApproveContract", value: "VII.Cho phê duyệt hợp đồng với ngày giờ phê duyệt < Ngày giờ hiện tại (Thông tin chi tiết hợp đồng)" },
        { key: "hideTelReport", value: "VIII.Không cho xem thông tin khách hàng (Báo cáo doanh thu bảo hiểm (Chi tiết) và Báo cáo tái tục (Chi tiết))" }
    ];
}