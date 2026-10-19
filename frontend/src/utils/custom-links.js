/**
 * OPUS RENTALS - REGISTRO DE LINKS DE IMÁGENES PERSONALIZADOS
 * 
 * Puedes pegar directamente aquí los enlaces que encuentres en Pinterest,
 * Google Imágenes, Catálogos CAT, Komatsu o cualquier página web.
 * (Clic derecho en la imagen -> "Copiar dirección de la imagen" y la pegas entre las comillas)l
 */

export const customLinks = {
  // =========================================================================
  // 1. IMÁGENES GENERALES DE LA PLATAFORMA
  // =========================================================================
  general: {
    // Foto grande del fondo del inicio (portada detrás del cotizador)
    heroBackground: '/assets/hero/hero-construction-helmet.png',

    // Foto para el lateral del modal de Login / Registro (construcción aérea, rascacielos o grúa)
    loginBackground: 'https://i.pinimg.com/1200x/8f/76/fb/8f76fb44afe8cdec2bfb8ba247a4b72a.jpg',

    // Foto de la máquina destacada en la sección 50/50 de la Guía Técnica del Home
    featuredMachineryGuide: 'https://i.pinimg.com/736x/2a/76/1c/2a761c8817df5d9d7823a963466f5769.jpg'
  },

  // =========================================================================
  // 2. CATEGORÍAS PRINCIPALES (Tarjetas del Home y Catálogo)
  // =========================================================================
  categories: {
    // 1: Excavadoras y Retroexcavadoras
    excavadoras: 'https://i.pinimg.com/1200x/2b/92/37/2b9237acc13d805d9821d1c8dd959cef.jpg',

    // 2: Concreto y Pavimentación (Mixer, allanadora, losas)
    concreto: 'https://i.pinimg.com/1200x/f3/e7/cf/f3e7cf4baa154d8fded03e8f38c3286f.jpg',

    // 3: Demolición y Martillos (Martillo rompepavimentos, operario demoliendo)
    demolicion: 'https://i.pinimg.com/736x/81/7a/af/817aaf4ddbc74d375ccb23a07a432632.jpg',

    // 7: Plataformas y Alturas (Tijera eléctrica, manlift, elevador)
    elevacion: 'https://i.pinimg.com/1200x/5f/9c/63/5f9c631348edc07830396f33b5d03f3f.jpg',

    // 8: Compactación de Suelos (Rodillo compactador, bailarina Wacker)
    compactacion: 'https://i.pinimg.com/736x/2d/55/90/2d5590442184f7e37fd50e4a42fba24a.jpg',

    // 5: Generación Eléctrica Diésel (Planta eléctrica industrial insonorizada)
    generadores: 'https://i.pinimg.com/1200x/3b/6d/11/3b6d1176286018af3055288599c6fcc6.jpg',

    // 6: Compresión y Neumática (Compresor de aire de tornillo portátil)
    compresores: 'https://i.pinimg.com/1200x/cd/61/cb/cd61cb8a9946f51edc63694496b3b8a4.jpg'
  },

  // =========================================================================
  // 3. PRODUCTOS DE LA FLOTA (Al menos 2 o 3 imágenes por máquina para la galería)
  // [fotoPrincipal, fotoSecundaria/lateral, fotoDetalle/cabina]
  // =========================================================================
  machinery: {
    // Tool 1: Miniexcavadora Caterpillar 303.5 CR
    1: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLOQS8CH2hCBpifrXlbLfW6EeSkxeHvoMyJ_PRjQtgQ&s=10', // Foto principal
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx008cWXzBVZItZT19X7xcuPAFbXnijmb_bBQL7U6Vqw&s=10', // Foto secundaria / lateral
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_C9Sv6WoT49H4zu4VgBeQFDQlbwMYMFaC_hKJT_36YQ&s=10'  // Foto detalle / cabina o balde
    ],

    // Tool 2: Excavadora Hidráulica Komatsu PC200-8M0
    2: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShU8FbSydXClD4Y8ZEwIwSiR6glQGw_padhNyPoFDOqE_XmLeVNc0x8LvA&s=10',
      'https://image.made-in-china.com/202f0j00nqKcmTfRSOoF/Used-Komatsu-PC200-8mo-Crawler-Excavator.webp',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-IGU8O67g7Gk0RF4UWJNmCBGalSjiY6IrHyRams9Qpw&s=10'
    ],

    // Tool 3: Martillo Demoledor Hexagonal Bosch GSH 27 VC
    3: [
      'https://www.bosch-professional.com/co/es/ocsmedia/76919-117/application-image/1434x828/martillo-de-percusion-pro-gsh-27-vc-061130a0g0.jpg',
      'https://media.aldiaferreteria.com/4771-large_default/martillo-demoledor-bosch-gsh-27-vc.webp',
      ''
    ],

    // Tool 4: Rompepavimentos Industrial Hilti TE 3000-AVR
    4: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9wT2vS1i4cvKz5W68bojKo7zvSDxIJXOyb9fCn3Be5JbHstXnU8cr3MQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfz7j0ZydM8s6aquaKCOUxWcl8yGOPmG-lVI3G7A6gxg&s=10',
      ''
    ],

    // Tool 5: Allanadora de Concreto Makita PT-36PRO (Helicóptero)
    5: [
      'https://maquitecdecolombia.com/wp-content/uploads/2020/06/Allanadora-de-Concreto-de-36P-MQ-vista-ppal.webp',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv0h9NlluRAUK_CeEvG-uCLOLc2EEuX3RdA1jk65xG-QHJQBMuynrOloNz&s=10',
      ''
    ],

    // Tool 6: Cortadora de Pavimento DeWalt D25980K
    6: [
      'https://cdnx.jumpseller.com/universaldetornillosyherr/image/61022611/resize/610/610?1742660666',
      'https://cdnx.jumpseller.com/universaldetornillosyherr/image/61022613/resize/610/610?1742660666',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSza_d9tqmhjcxqSdGuBFmIPqNc0pXzIzAvb4rIU_HZtw&s=10'
    ],

    // Tool 7: Vibrocompactador Pata de Elefante (Bailarina) Wacker Neuson BS 50-2plus
    7: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1V3BqBov9z53oq-oZ4Kz1p5tHGxdzbBavxpdw-jorEQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu31-yL4Zt889RthBgyYyj0OkyNc5fV4Bbm8X0fdyEqQ&s=10',
      ''
    ],

    // Tool 8: Retroexcavadora JCB 3CX ECO
    8: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu9WeuFoy7Zl-Y_yZS74Aa6lYMZ-7OI0uWRxW6taV4pltOUVOYPTWRIzs&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9uRsiDAXdwj5rkMGf_VqlAokj-kfS4_ZyuGVgI3GpRgRcPoO8qVQ5fftr&s=10',
      ''
    ],

    // Tool 9: Minicargador Compacto Bobcat S550
    9: [
      'https://gorental.cl/wp-content/uploads/2019/06/MINICARGADOR-BOBCAT-S550-02.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWUCxbOO2vQJGVV5kT9mfLlIJwdlh5j3arp7lC9P7ImQ&s=10',
      ''
    ],

    // Tool 10: Plataforma Elevadora Tijera Genie GS-2646
    10: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSGBs_VABt_bOKO-SoCJuOWYDzNo30XCIJbwfKJaBENdAUlRmTCMs5YePC&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUgfvLCBgZzaIlORUDCiDI4WlSWJ0ukiXd4_KjuXv2wA&s=10',
      ''
    ],

    // Tool 11: Compresor de Aire Tornillo Atlas Copco XAS 88
    11: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2D49RvDt6pHDFhk375NPNOKI0YSLABVbzCvENW_OK8g&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp8ufeOIBTt0LdcUurPzfD0xNzZLyjgbR8zB5qFrN1Kg&s=10',
      ''
    ],

    // Tool 12: Excavadora Sany SY215C
    12: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREeTuBzAGcb1OkE7tCbODwdQJ2ZBi_xiNoDN8a33DUrQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcsgPFUxcaq1OK5GkWCI3gBS6Indl9L6POE0bbNmrLTg&s=10',
      ''
    ],

    // Tool 13: Cargador Frontal Volvo L90H
    13: [
      'https://cdn.prod.website-files.com/69d4385d906cbf20ee919b6e/6a6cd0b8f13fabf73dabf4b0_Cargadora_Volvo_L90h.jpeg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbZ7WHktVZE-2C6Vx1tmYUt795LGt6i-foFzm0Dq-FjQ&s=10',
      ''
    ],

    // Tool 14: Grúa Torre Desplegable Liebherr 81 K.1
    14: [
      'https://www.lectura-specs.es/models/renamed/detail_max_retina/gruas-torre-con-rotacion-inferior-81-k-1-liebherr.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCMk690sKMmufgdV6BIFDNm8855Wt4jlgn3gqYfcJ6Ww&s=10',
      ''
    ],

    // Tool 15: Cortadora de Concreto Manual Husqvarna K 970 II
    15: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYQvkTfpithLiWaf68ypi2Nq0RFWbvF226WrE2pE-2_Q&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtvux11aHq8M8izq1XcLUjN6aUf4-YMfxEEPsxhGWssg&s=10',
      ''
    ],

    // Tool 16: Miniexcavadora Kubota U35-4
    16: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ6CVWW9IJOixGC6sRLVtx86TElN--H1y0rHWjpDKcBQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT81VY7aw9FCeymkOFjyQSvktGOav4Psfxpi4Qqs2XL-juIW_oM-EZAQY2&s=10',
      ''
    ],

    // Tool 17: Cortadora de Disco Stihl TS 800
    17: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbI8esw4IjHsNoh3re2v8H3C1hkAx5TiIeJ89QaE8WV3KEgCVCLF2OTEI&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZx9_pK2EMVkHt2EjFlhpV6glFMA5VV4N3cJfv1eKuXA&s=10',
      ''
    ],

    // Tool 18: Planta Soldadora Diésel Miller Bobcat 250
    18: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeHTHVvg5c4OboqoiyFqDD_DuY7JA4gRgcRQZYhZrGjhgBsKcWy4cJeOM&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCguRLbglsxI_2GBOrgLOqT1QiFpVWtRdnSvTfoP08Sw&s=10',
      ''
    ],

    // Tool 19: Equipo de Soldadura Lincoln Electric Ranger 305D
    19: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2dFGJsTCAAzixrbyqJ_ht9AbpZJc5-5aY8ggcrye_0fSmSOvFIIAq6fQ&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1-ov0LSm_KMeDW8PTovVhxhpHFt5nZ_vhmQwRfNkHHw&s=10',
      ''
    ],

    // Tool 20: Trituradora de Escombros Móvil Terex Finlay J-1170
    20: [
      'https://www.lectura-specs.es/models/renamed/orig/plantas-de-reciclaje-de-escombros-j-1170-terex-finlay(2).jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfKqmcQ066SHUnC5M7Jm1cNcL7XUHNiEc5JZ_jfZKYdA&s=10',
      ''
    ],

    // Tool 21: Generador Diésel Silencioso Caterpillar DE65 GC
    21: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJBKh2GiBWAltBahO4vIKkCRe6v7xF__VDuSdwD36YRw&s',
      'https://s7d2.scene7.com/is/image/Caterpillar/CM20200507-d3c3a-caacb?$webp-cc-s$',
      ''
    ],

    // Tool 22: Rodillo Compactador Doble Tambor Komatsu JV40DW
    22: [
      'https://mtroyal.com.tr/en/wp-content/uploads/2024/11/Komatsu-JV40DW-Double-Drum-Vibratory-Roller-1.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzdks8xrLBuoYPY88oot3qIHKceRwMZ1yOHsOM83oevlQFVqu02MFjNbE&s=10',
      ''
    ],

    // Tool 23: Camión Mezclador / Mixer de Concreto Bosch GVC 22 EX
    23: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT517AOuLi2yVab7OlO3a0UtSq322LgIdmQtTpLCHn9MA&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0zgX7wsZvtq-Lyb8Mc_0FA_ysC37DVSnDXoddzHt-xg&s=10',
      ''
    ],

    // Tool 24: Estación Total Láser Hilti POS 150
    24: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBZXQJR-V09Tlx8gQrX72joMhde6ANdfQxvgSmr_BYEEGcWTnQV4dmb_I&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv3Tq9ZMltQI9lon9Tvouce0i7e7eMYpDUcIvGTv0rwA&s',
      ''
    ],

    // Tool 25: Motobomba de Lodos Makita EW3051H
    25: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTM1y4WDG0EEyPhsusDp6EJCSQE3iCQ_tQhs89KmTq_ZSZtjq8_gB410c&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRhS_L2z5_FUDC4Lj_J5xLgtBB1DMVB-QmNcKSFJSzcA&s',
      ''
    ]
  }
};

export default customLinks;
