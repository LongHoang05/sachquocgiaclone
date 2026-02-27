aliasConfig = {
    appName: ["", "", ""],
    totalPageCount: [],
    largePageWidth: [],
    largePageHeight: [],
    normalPath: [],
    largePath: [],
    thumbPath: [],
    ToolBarsSettings: [],
    TitleBar: [],
    appLogoIcon: ["appLogoIcon"],
    appLogoLinkURL: ["/"],
    bookTitle: [],
    bookDescription: [],
    ButtonsBar: [],
    ShareButton: [],
    ShareButtonVisible: ["socialShareButtonVisible"],
    ThumbnailsButton: [],
    ThumbnailsButtonVisible: ["enableThumbnail"],
    ZoomButton: [],
    ZoomButtonVisible: ["enableZoomIn"],
    FlashDisplaySettings: [],
    MainBgConfig: [],
    bgBeginColor: ["bgBeginColor"],
    bgEndColor: ["bgEndColor"],
    bgMRotation: ["bgMRotation"],
    backGroundImgURL: ["mainbgImgUrl", "innerMainbgImgUrl"],
    pageBackgroundColor: ["pageBackgroundColor"],
    flipshortcutbutton: [],
    BookMargins: [],
    topMargin: [],
    bottomMargin: [],
    leftMargin: [],
    rightMargin: [],
    HTMLControlSettings: [],
    linkconfig: [],
    LinkDownColor: ["linkOverColor"],
    LinkAlpha: ["linkOverColorAlpha"],
    OpenWindow: ["linkOpenedWindow"],
    searchColor: [],
    searchAlpha: [],
    SearchButtonVisible: ["searchButtonVisible"],
    productName: [],
    homePage: ["/"],
    enableAutoPlay: ["autoPlayAutoStart"],
    autoPlayDuration: ["autoPlayDuration"],
    autoPlayLoopCount: ["autoPlayLoopCount"],
    BookMarkButtonVisible: [],
    googleAnalyticsID: ["googleAnalyticsID"],
    OriginPageIndex: [],
    HardPageEnable: ["isHardCover"],
    RightToLeft: ["isRightToLeft"],
    LeftShadowWidth: ["leftPageShadowWidth"],
    LeftShadowAlpha: ["pageShadowAlpha"],
    RightShadowWidth: ["rightPageShadowWidth"],
    RightShadowAlpha: ["pageShadowAlpha"],
    ShortcutButtonHeight: [],
    ShortcutButtonWidth: [],
    AutoPlayButtonVisible: ["enableAutoPlay"],
    DownloadButtonVisible: [],
    DownloadURL: ["downloadURL"],
    HomeButtonVisible: ["homeButtonVisible"],
    HomeURL: ['btnHomeURL'],
    BackgroundSoundURL: ['bacgroundSoundURL'],
    PrintButtonVisible: ["enablePrint"],
    toolbarColor: ["mainColor", "barColor"],
    loadingBackground: ["mainColor", "barColor"],
    BackgroundSoundButtonVisible: ["enableFlipSound"],
    FlipSound: ["enableFlipSound"],
    MiniStyle: ["userSmallMode"],
    retainBookCenter: ["moveFlipBookToCenter"],
    totalPagesCaption: ["totalPageNumberCaptionStr"],
    pageNumberCaption: ["pageIndexCaptionStrs"]
};
aliasLanguage = {
    frmPrintbtn: ["frmPrintCaption"],
    frmPrintall: ["frmPrintPrintAll"],
    frmPrintcurrent: ["frmPrintPrintCurrentPage"],
    frmPrintRange: ["frmPrintPrintRange"],
    frmPrintexample: ["frmPrintExampleCaption"],
    btnLanguage: ["btnSwicthLanguage"],
    btnTableOfContent: ["btnBookMark"]
};
if (bookConfig === undefined)
    bookConfig = {};
bookConfig.appName = 'VHMT Ebook Reader';
bookConfig.ToolBarsSettings = "";
bookConfig.TitleBar = "";
bookConfig.appLogoLinkURL = "/";
bookConfig.bookDescription = "";
bookConfig.ButtonsBar = "";
bookConfig.ShareButton = "";
bookConfig.ThumbnailsButton = "";
bookConfig.ThumbnailsButtonVisible = "Show";
bookConfig.ZoomButton = "";
bookConfig.ZoomButtonVisible = "Yes";
bookConfig.FlashDisplaySettings = "";
bookConfig.MainBgConfig = "";
bookConfig.bgBeginColor = "#cccccc";
bookConfig.bgEndColor = "#eeeeee";
bookConfig.bgMRotation = 45;
bookConfig.pageBackgroundColor = "#FFFFFF";
bookConfig.flipshortcutbutton = "Show";
bookConfig.BookMargins = "";
bookConfig.topMargin = 5;
bookConfig.bottomMargin = 5;
bookConfig.leftMargin = 5;
bookConfig.rightMargin = 5;
bookConfig.HTMLControlSettings = "";
bookConfig.linkconfig = "";
bookConfig.LinkDownColor = "#808080";
bookConfig.LinkAlpha = 0.5;
bookConfig.OpenWindow = "_Blank";
bookConfig.BookMarkButtonVisible = 'Show';
bookConfig.productName = '';
bookConfig.homePage = '/';
bookConfig.isFlipPdf = "true";
bookConfig.TableOfContentButtonVisible = "Show";
bookConfig.searchPositionJS = undefined;
bookConfig.BookTemplateName = "metro";
bookConfig.loadingCaptionFontSize = "20";
bookConfig.loadingCaptionColor = "#DDDDDD";
bookConfig.loadingBackground = "#16233A";
bookConfig.toolbarColor = "#000000";
bookConfig.iconColor = "#ECF5FB";
bookConfig.pageNumColor = "#000000";
bookConfig.iconFontColor = "#FFFFFF";
bookConfig.toolbarAlwaysShow = "No";
bookConfig.ToolBarVisible = "Yes";
bookConfig.formFontColor = "#FFFFFF";
bookConfig.formBackgroundColor = "#021d36";
bookConfig.ToolBarAlpha = "0.5";
bookConfig.CurlingPageCorner = "Yes";
bookConfig.showBookInstructionOnStart = "false";
bookConfig.InstructionsButtonVisible = "Show";
bookConfig.showInstructionOnStart = "No";
bookConfig.showGotoButtonsAtFirst = "No";
bookConfig.QRCode = "Hide";
bookConfig.HomeButtonVisible = "Hide";
bookConfig.HomeURL = "%first page%";
bookConfig.aboutButtonVisible = "Hide";
bookConfig.enablePageBack = "Show";
bookConfig.ShareButtonVisible = "Hide";
bookConfig.addCurrentPage = "No";
bookConfig.EmailButtonVisible = "Hide";
bookConfig.btnShareWithEmailBody = "{link}";
bookConfig.ThumbnailsButtonVisible = "Show";
bookConfig.thumbnailColor = "#333333";
bookConfig.thumbnailAlpha = "70";
bookConfig.ThumbnailSize = "small";
bookConfig.BookMarkButtonVisible = "Show";
bookConfig.TableOfContentButtonVisible = "Show";
bookConfig.isHideTabelOfContentNodes = "yes";
bookConfig.SearchButtonVisible = "Show";
bookConfig.leastSearchChar = "3";
bookConfig.searchKeywordFontColor = "#FFB000";
bookConfig.searchHightlightColor = "#ffff00";
bookConfig.SelectTextButtonVisible = "Hide";
bookConfig.PrintButtonVisible = "Hide";
bookConfig.BackgroundSoundButtonVisible = "Show";
bookConfig.FlipSound = "Yes";
bookConfig.BackgroundSoundLoop = "-1";
bookConfig.bgSoundVol = "50";
bookConfig.AutoPlayButtonVisible = "Show";
bookConfig.autoPlayAutoStart = "No";
bookConfig.autoPlayDuration = "9";
bookConfig.autoPlayLoopCount = "1";
bookConfig.ZoomButtonVisible = "Show";
bookConfig.maxZoomWidth = "3509";
bookConfig.defaultZoomWidth = "1000";
bookConfig.mouseWheelFlip = "Yes";
bookConfig.ZoomMapVisible = "Hide";
bookConfig.DownloadButtonVisible = "Hide";
bookConfig.PhoneButtonVisible = "Hide";
bookConfig.AnnotationButtonVisible = "Show";
bookConfig.FullscreenButtonVisible = "Show";
bookConfig.MagnifierButtonVisible = "Hide";
bookConfig.bgBeginColor = "#40a1b2";
bookConfig.bgEndColor = "#40a1b2";
bookConfig.bgMRotation = "90";
bookConfig.backgroundPosition = "stretch";
bookConfig.backgroundOpacity = "100";
bookConfig.backgroundScene = "None";
bookConfig.LeftShadowWidth = "15";
bookConfig.LeftShadowAlpha = "0.1";
bookConfig.RightShadowWidth = "15";
bookConfig.RightShadowAlpha = "0.1";
bookConfig.ShowTopLeftShadow = "No";
bookConfig.pageHighlightType = "magazine";
bookConfig.HardPageEnable = "No";
bookConfig.hardCoverBorderWidth = "8";
bookConfig.borderColor = "#572F0D";
bookConfig.outerCoverBorder = "Yes";
bookConfig.cornerRound = "8";
bookConfig.leftMarginOnMobile = "0";
bookConfig.topMarginOnMobile = "0";
bookConfig.rightMarginOnMobile = "0";
bookConfig.bottomMarginOnMobile = "0";
bookConfig.pageBackgroundColor = "#E8E8E8";
bookConfig.flipshortcutbutton = "Show";
bookConfig.phoneFlipShortcutButton = "Hide";
bookConfig.BindingType = "side";
bookConfig.RightToLeft = "No";
bookConfig.FlipDirection = "0";
bookConfig.flippingTime = "0.1";
bookConfig.retainBookCenter = "Yes";
bookConfig.FlipStyle = "Flip";
bookConfig.autoDoublePage = "Yes";
bookConfig.isTheBookOpen = "No";
bookConfig.DoubleSinglePageButtonVisible = "hide";
bookConfig.thicknessWidthType = "Thinner";
bookConfig.thicknessColor = "#ffffff";
bookConfig.SingleModeBanFlipToLastPage = "No";
bookConfig.showThicknessOnMobile = "No";
bookConfig.isSingleBookFullWindowOnMobile = "no";
bookConfig.isStopMouseMenu = "yes";
bookConfig.restorePageVisible = "No";
bookConfig.topMargin = "5";
bookConfig.bottomMargin = "5";
bookConfig.leftMargin = "10";
bookConfig.rightMargin = "10";
bookConfig.hideMiniFullscreen = "no";
bookConfig.maxWidthToSmallMode = "400";
bookConfig.maxHeightToSmallMode = "300";
bookConfig.leftRightPnlShowOption = "None";
bookConfig.highDefinitionConversion = "yes";
bookConfig.LargeLogoPosition = "top-left";
bookConfig.LargeLogoTarget = "Self";
bookConfig.isFixLogoSize = "No";
bookConfig.logoFixWidth = "0";
bookConfig.logoFixHeight = "0";
bookConfig.SupportOperatePageZoom = "Yes";
bookConfig.showHelpContentAtFirst = "No";
bookConfig.updateURLForPage = "No";
bookConfig.passwordTips = "";
bookConfig.OnlyOpenInIframe = "No";
bookConfig.OnlyOpenInIframeInfo = "No reading rights";
bookConfig.OpenWindow = "Self";
bookConfig.showLinkHint = "No";
bookConfig.MidBgColor = "#283107";
bookConfig.useTheAliCloudChart = "no";
bookConfig.productName = "";
bookConfig.isFlipPdf = true;