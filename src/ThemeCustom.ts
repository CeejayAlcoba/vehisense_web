import { ThemeConfig } from 'antd';

export const PRIMARY_COLOR = "#1d824c";
export const STRONG_PRIMARY_COLOR ="#044f1f";
export const GREY_COLOR = "#cccccc";
const themeCustom: ThemeConfig = {
  token: {
    colorPrimary: PRIMARY_COLOR,
    borderRadius: 8,
    colorBgContainer: '#f0f2f5',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      footerBg: '#ffffff',
      siderBg: STRONG_PRIMARY_COLOR,
      headerColor: '#333',
    },
    Button: {
      colorPrimaryHover: '#169b6b',
    },
    Card:{
      colorBorderSecondary:GREY_COLOR,
      headerBg:GREY_COLOR,
      headerFontSize:"20px"
    },
    Menu: {
      colorBgBase:'#ffffff',   
      itemColor: '#ffffff',                         
      itemSelectedBg: '#ffffff',            
      itemHoverBg: '#ffffff',               
      itemBg: 'transparent',                
      popupBg: '#ffffff',                   
      itemMarginInline: 12,
      itemHeight: 48,
    },
    
  },
};

export default themeCustom;
