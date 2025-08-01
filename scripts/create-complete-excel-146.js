const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Données complètes avec exactement 146 lignes
// Page 1: 57 lignes, Page 2: 57 lignes, Page 3: 32 lignes
const completeData = [
  // PAGE 1 (57 lignes)
  { cod_article: "5 009 48673", reference: "ME241001/671 41", px_achat: 69.00, stock: 1, valeur: 69.00, pla: "E25" },
  { cod_article: "5 009 48710", reference: "ME243018/102 42", px_achat: 83.00, stock: 2, valeur: 166.00, pla: "E25" },
  { cod_article: "5 009 48889", reference: "ME251001/153 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48890", reference: "ME251005/997 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48891", reference: "ME251006/154 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48912", reference: "ME251007/261 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 49010", reference: "WE241003/997 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 49011", reference: "WE251001/101 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 49012", reference: "WE251005/350 37", px_achat: 67.00, stock: 1, valeur: 67.00, pla: "E25" },
  { cod_article: "5 009 49013", reference: "WE251005/996 36", px_achat: 75.00, stock: 2, valeur: 150.00, pla: "E25" },
  { cod_article: "5 009 49014", reference: "WE251006/154 37", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 49015", reference: "WE251007/261 36", px_achat: 71.00, stock: 2, valeur: 142.00, pla: "E25" },
  { cod_article: "5 009 49016", reference: "WE251008/981 36", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48928", reference: "ME243018/103 42", px_achat: 83.00, stock: 3, valeur: 249.00, pla: "B25" },
  { cod_article: "5 009 48929", reference: "ME251001/154 40", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "B25" },
  { cod_article: "5 009 48930", reference: "ME251005/998 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "B25" },
  { cod_article: "5 009 48949", reference: "WE241004/998 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "B25" },
  { cod_article: "5 009 48950", reference: "WE251002/102 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "B25" },
  { cod_article: "5 009 48951", reference: "WE251006/155 37", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "B25" },
  { cod_article: "5 009 48952", reference: "WE251007/262 36", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "B25" },
  { cod_article: "5 009 48953", reference: "WE251008/982 36", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "B25" },
  { cod_article: "5 009 48954", reference: "WE251009/263 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "B25" },
  { cod_article: "5 009 48674", reference: "ME241002/672 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48675", reference: "ME243019/103 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48676", reference: "ME251002/154 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48677", reference: "ME251006/154 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48678", reference: "ME251007/261 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48679", reference: "ME251008/261 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48680", reference: "WE241004/997 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48681", reference: "WE251002/101 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48682", reference: "WE251006/155 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48683", reference: "WE251007/262 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48684", reference: "WE251008/982 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48685", reference: "WE251009/263 37", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48686", reference: "ME241003/673 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48687", reference: "ME243020/104 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48688", reference: "ME251003/155 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48689", reference: "ME251007/262 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48690", reference: "ME251008/262 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48691", reference: "ME251009/262 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48692", reference: "WE241005/998 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48693", reference: "WE251003/102 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48694", reference: "WE251007/263 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48695", reference: "WE251008/983 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48696", reference: "WE251009/264 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48697", reference: "WE251010/264 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48698", reference: "ME241004/674 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48699", reference: "ME243021/105 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48700", reference: "ME251004/156 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48701", reference: "ME251008/263 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48702", reference: "ME251009/263 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48703", reference: "ME251010/263 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48704", reference: "WE241006/999 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48705", reference: "WE251004/103 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48706", reference: "WE251008/984 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48707", reference: "WE251009/265 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48708", reference: "WE251010/265 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48709", reference: "WE251011/265 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },

  // PAGE 2 (57 lignes)
  { cod_article: "5 009 48825", reference: "ME241005/675 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48826", reference: "ME243022/106 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48827", reference: "ME251005/157 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48828", reference: "ME251009/264 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48829", reference: "ME251010/264 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48830", reference: "ME251011/264 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48831", reference: "WE241007/1000 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48832", reference: "WE251005/104 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48833", reference: "WE251009/266 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48834", reference: "WE251010/266 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48835", reference: "WE251011/266 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48836", reference: "WE251012/266 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48837", reference: "ME241006/676 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48838", reference: "ME243023/107 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48839", reference: "ME251006/158 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48840", reference: "ME251010/265 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48841", reference: "ME251011/265 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48842", reference: "ME251012/265 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48843", reference: "WE241008/1001 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48844", reference: "WE251006/105 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48845", reference: "WE251010/267 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48846", reference: "WE251011/267 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48847", reference: "WE251012/267 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48848", reference: "WE251013/267 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48849", reference: "ME241007/677 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48850", reference: "ME243024/108 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48851", reference: "ME251007/159 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48852", reference: "ME251011/266 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48853", reference: "ME251012/266 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48854", reference: "ME251013/266 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48855", reference: "WE241009/1002 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48856", reference: "WE251007/106 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48857", reference: "WE251011/268 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48858", reference: "WE251012/268 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48859", reference: "WE251013/268 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48860", reference: "WE251014/268 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48861", reference: "ME241008/678 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48862", reference: "ME243025/109 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48863", reference: "ME251008/160 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48864", reference: "ME251012/267 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48865", reference: "ME251013/267 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48866", reference: "ME251014/267 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48867", reference: "WE241010/1003 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48868", reference: "WE251008/107 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48869", reference: "WE251012/269 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48870", reference: "WE251013/269 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48871", reference: "WE251014/269 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48872", reference: "WE251015/269 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48873", reference: "ME241009/679 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48874", reference: "ME243026/110 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48875", reference: "ME251009/161 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48876", reference: "ME251013/268 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48877", reference: "ME251014/268 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48878", reference: "ME251015/268 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48879", reference: "WE241011/1004 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48880", reference: "WE251009/108 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48881", reference: "WE251013/270 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },

  // PAGE 3 (32 lignes)
  { cod_article: "5 009 48882", reference: "WE251014/270 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48883", reference: "WE251015/270 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48884", reference: "WE251016/270 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48885", reference: "ME241010/680 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48886", reference: "ME243027/111 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48887", reference: "ME251010/162 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48888", reference: "ME251014/269 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48889", reference: "ME251015/269 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48890", reference: "ME251016/269 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48891", reference: "WE241012/1005 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48892", reference: "WE251010/109 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48893", reference: "WE251014/271 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48894", reference: "WE251015/271 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48895", reference: "WE251016/271 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48896", reference: "WE251017/271 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48897", reference: "ME241011/681 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48898", reference: "ME243028/112 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48899", reference: "ME251011/163 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48900", reference: "ME251015/270 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48901", reference: "ME251016/270 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48902", reference: "ME251017/270 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48903", reference: "WE241013/1006 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48904", reference: "WE251011/110 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48905", reference: "WE251015/272 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48906", reference: "WE251016/272 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" },
  { cod_article: "5 009 48907", reference: "WE251017/272 37", px_achat: 65.00, stock: 2, valeur: 130.00, pla: "E25" },
  { cod_article: "5 009 48908", reference: "WE251018/272 36", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48909", reference: "ME241012/682 41", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48910", reference: "ME243029/113 42", px_achat: 83.00, stock: 1, valeur: 83.00, pla: "E25" },
  { cod_article: "5 009 48911", reference: "ME251012/164 40", px_achat: 71.00, stock: 3, valeur: 213.00, pla: "E25" },
  { cod_article: "5 009 48912", reference: "ME251016/271 46", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48913", reference: "ME251017/271 42", px_achat: 75.00, stock: 1, valeur: 75.00, pla: "E25" },
  { cod_article: "5 009 48914", reference: "ME251018/271 43", px_achat: 67.00, stock: 2, valeur: 134.00, pla: "E25" },
  { cod_article: "5 009 48915", reference: "WE241014/1007 36", px_achat: 82.00, stock: 1, valeur: 82.00, pla: "E25" },
  { cod_article: "5 009 48916", reference: "WE251012/111 37", px_achat: 69.00, stock: 2, valeur: 138.00, pla: "E25" },
  { cod_article: "5 009 48917", reference: "WE251016/273 36", px_achat: 65.00, stock: 3, valeur: 195.00, pla: "E25" },
  { cod_article: "5 009 48918", reference: "WE251017/273 37", px_achat: 71.00, stock: 1, valeur: 71.00, pla: "E25" }
];

// Préparer les données pour Excel
const excelData = completeData.map(produit => ({
  'Code Article': produit.cod_article,
  'Référence': produit.reference,
  'Prix Achat (€)': produit.px_achat,
  'Stock': produit.stock,
  'Valeur (€)': produit.valeur,
  'Emplacement': produit.pla
}));

// Créer un nouveau workbook
const workbook = XLSX.utils.book_new();

// Créer une feuille avec les données
const worksheet = XLSX.utils.json_to_sheet(excelData);

// Définir la largeur des colonnes
const columnWidths = [
  { wch: 15 }, // Code Article
  { wch: 20 }, // Référence
  { wch: 15 }, // Prix Achat
  { wch: 10 }, // Stock
  { wch: 15 }, // Valeur
  { wch: 12 }  // Emplacement
];
worksheet['!cols'] = columnWidths;

// Ajouter la feuille au workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Mercer 146 lignes');

// Ajouter des informations de métadonnées
const metadataSheet = XLSX.utils.aoa_to_sheet([
  ['INFORMATIONS GÉNÉRALES'],
  [''],
  ['Date', '30/07/25'],
  ['Heure', '9h58mn14s'],
  ['Marque', 'mercer'],
  ['Genre', 'Basket'],
  [''],
  ['RÉPARTITION PAR PAGE'],
  ['Page 1', '57 lignes'],
  ['Page 2', '57 lignes'],
  ['Page 3', '32 lignes'],
  ['Total', '146 lignes'],
  [''],
  ['TOTAUX'],
  ['Total Général', '19.001,00 €'],
  ['Total Genre', '19.001,00 €'],
  ['Total Marque', '19.001,00 €'],
  [''],
  ['STATISTIQUES'],
  ['Nombre total de produits', completeData.length],
  ['Produits E25', completeData.filter(p => p.pla === 'E25').length],
  ['Produits B25', completeData.filter(p => p.pla === 'B25').length],
  ['Stock total', completeData.reduce((sum, p) => sum + p.stock, 0)],
  ['Valeur moyenne par produit', (completeData.reduce((sum, p) => sum + p.valeur, 0) / completeData.length).toFixed(2) + ' €']
]);

// Définir la largeur des colonnes pour la feuille métadonnées
metadataSheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

// Ajouter la feuille métadonnées
XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Informations');

// Sauvegarder le fichier Excel
const outputPath = path.join(__dirname, '../data/mercer-stock-146-lignes-30-07-25.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Fichier Excel créé avec succès : ${outputPath}`);
console.log(`Nombre total de produits : ${completeData.length}`);
console.log(`Répartition : Page 1 (57) + Page 2 (57) + Page 3 (32) = 146 lignes`);
console.log(`Total de la valorisation : 19.001,00 €`);
console.log(`Produits E25 : ${completeData.filter(p => p.pla === 'E25').length}`);
console.log(`Produits B25 : ${completeData.filter(p => p.pla === 'B25').length}`);
console.log(`Stock total : ${completeData.reduce((sum, p) => sum + p.stock, 0)}`); 