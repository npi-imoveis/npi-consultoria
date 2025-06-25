(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[9551], {
    99451: function(e, a, t) {
        Promise.resolve().then(t.bind(t, 10912)),
        Promise.resolve().then(t.bind(t, 61481)),
        Promise.resolve().then(t.bind(t, 93215))
    },
    83495: function(e, a, t) {
        "use strict";
        var o = t(57437);
        t(87138);
        var l = t(2265);
        a.Z = e => {
            let {title: a, onClose: t, children: r, description: i, buttonText: s, link: n} = e
              , [d,c] = (0,
            l.useState)(!0)
              , m = () => {
                c(!1),
                t && t()
            }
            ;
            return d ? (0,
            o.jsx)("div", {
                className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
                children: (0,
                o.jsxs)("div", {
                    className: "bg-white rounded-lg shadow-xl max-w-md w-full",
                    children: [(0,
                    o.jsxs)("div", {
                        className: "flex justify-between items-center border-b p-4",
                        children: [(0,
                        o.jsx)("h2", {
                            className: "text-xl font-semibold",
                            children: a
                        }), (0,
                        o.jsx)("button", {
                            onClick: m,
                            className: "text-gray-600 hover:text-gray-900",
                            children: "✕"
                        })]
                    }), r && (0,
                    o.jsx)("div", {
                        className: "p-4",
                        children: r
                    }), !r && (0,
                    o.jsx)("div", {
                        className: "p-4",
                        children: (0,
                        o.jsx)("p", {
                            children: i
                        })
                    }), (0,
                    o.jsx)("div", {
                        className: "w-full flex justify-end p-4",
                        children: (0,
                        o.jsx)("button", {
                            onClick: () => {
                                n ? window.open(n, "_blank") : m()
                            }
                            ,
                            className: "bg-black text-white px-4 py-2 rounded hover:bg-opacity-80 transition duration-300",
                            children: s
                        })
                    })]
                })
            }) : null
        }
    },
    93215: function(e, a, t) {
        "use strict";
        t.r(a),
        t.d(a, {
            default: function() {
                return ea
            }
        });
        var o = t(57437)
          , l = t(2265)
          , r = t(16463)
          , i = t(24613)
          , s = t(66648)
          , n = t(32520)
          , d = e => {
            let {title: a="Upload de Imagens", onClose: t, onUploadComplete: r} = e
              , [i,d] = (0,
            l.useState)(!0)
              , [c,m] = (0,
            l.useState)(!1)
              , [u,g] = (0,
            l.useState)([])
              , [p,b] = (0,
            l.useState)(!1)
              , x = () => {
                d(!1),
                t && t()
            }
              , v = e => {
                e.preventDefault(),
                e.stopPropagation(),
                "dragenter" === e.type || "dragover" === e.type ? m(!0) : "dragleave" === e.type && m(!1)
            }
              , h = e => {
                let a = Array.from(e).map(e => ({
                    file: e,
                    preview: URL.createObjectURL(e),
                    name: e.name
                }));
                g(e => [...e, ...a])
            }
              , f = e => {
                g(a => {
                    let t = [...a];
                    return URL.revokeObjectURL(t[e].preview),
                    t.splice(e, 1),
                    t
                }
                )
            }
              , y = async () => {
                if (0 !== u.length) {
                    b(!0);
                    try {
                        let e = [];
                        for (let a of u) {
                            let t = await (0,
                            n.z)(a.file);
                            await (0,
                            n.p)(t) && e.push({
                                Foto: t.fileUrl,
                                Destaque: "Nao"
                            })
                        }
                        r && r(e),
                        x()
                    } catch (e) {
                        console.error("Erro ao fazer upload das imagens:", e)
                    } finally {
                        b(!1)
                    }
                }
            }
            ;
            return i ? (0,
            o.jsx)("div", {
                className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
                children: (0,
                o.jsxs)("div", {
                    className: "bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col",
                    children: [(0,
                    o.jsxs)("div", {
                        className: "flex justify-between items-center border-b p-4 flex-shrink-0",
                        children: [(0,
                        o.jsx)("h2", {
                            className: "text-xl font-semibold",
                            children: a
                        }), (0,
                        o.jsx)("button", {
                            onClick: x,
                            className: "text-gray-600 hover:text-gray-900",
                            children: "✕"
                        })]
                    }), (0,
                    o.jsxs)("div", {
                        className: "p-6 flex-1 overflow-y-auto",
                        children: [(0,
                        o.jsx)("div", {
                            className: "border-2 border-dashed rounded-lg p-8 text-center ".concat(c ? "border-blue-500 bg-blue-50" : "border-gray-300"),
                            onDragEnter: v,
                            onDragLeave: v,
                            onDragOver: v,
                            onDrop: e => {
                                e.preventDefault(),
                                e.stopPropagation(),
                                m(!1),
                                e.dataTransfer.files && e.dataTransfer.files.length > 0 && h(e.dataTransfer.files)
                            }
                            ,
                            children: (0,
                            o.jsxs)("div", {
                                className: "flex flex-col items-center",
                                children: [(0,
                                o.jsx)("svg", {
                                    className: "w-12 h-12 text-gray-400 mb-4",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    children: (0,
                                    o.jsx)("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: "2",
                                        d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    })
                                }), (0,
                                o.jsx)("p", {
                                    className: "mb-2 text-lg font-semibold",
                                    children: "Arraste e solte as imagens aqui"
                                }), (0,
                                o.jsx)("p", {
                                    className: "text-sm text-gray-500 mb-4",
                                    children: "ou"
                                }), (0,
                                o.jsxs)("label", {
                                    className: "px-4 py-2 bg-black rounded-md text-white hover:bg-black/80 cursor-pointer",
                                    children: ["Selecionar arquivos", (0,
                                    o.jsx)("input", {
                                        type: "file",
                                        className: "hidden",
                                        onChange: e => {
                                            e.target.files && e.target.files.length > 0 && h(e.target.files)
                                        }
                                        ,
                                        accept: "image/*",
                                        multiple: !0
                                    })]
                                }), (0,
                                o.jsx)("p", {
                                    className: "mt-2 text-xs text-gray-500",
                                    children: "PNG, JPG, GIF (max. 10MB)"
                                })]
                            })
                        }), u.length > 0 && (0,
                        o.jsxs)("div", {
                            className: "mt-6",
                            children: [(0,
                            o.jsx)("h3", {
                                className: "text-md font-medium mb-3",
                                children: "Imagens selecionadas"
                            }), (0,
                            o.jsx)("div", {
                                className: "grid grid-cols-3 gap-4",
                                children: u.map( (e, a) => (0,
                                o.jsxs)("div", {
                                    className: "relative group",
                                    children: [(0,
                                    o.jsx)("div", {
                                        className: "relative h-32 w-full overflow-hidden rounded-lg border border-gray-200",
                                        children: (0,
                                        o.jsx)(s.default, {
                                            src: e.preview,
                                            alt: e.name,
                                            fill: !0,
                                            style: {
                                                objectFit: "cover"
                                            }
                                        })
                                    }), (0,
                                    o.jsx)("button", {
                                        onClick: () => f(a),
                                        className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                        children: (0,
                                        o.jsx)("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            xmlns: "http://www.w3.org/2000/svg",
                                            children: (0,
                                            o.jsx)("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: "2",
                                                d: "M6 18L18 6M6 6l12 12"
                                            })
                                        })
                                    }), (0,
                                    o.jsx)("p", {
                                        className: "text-xs mt-1 truncate",
                                        children: e.name
                                    })]
                                }, a))
                            })]
                        })]
                    }), (0,
                    o.jsxs)("div", {
                        className: "border-t p-4 flex justify-end gap-3 flex-shrink-0",
                        children: [(0,
                        o.jsx)("button", {
                            onClick: x,
                            className: "px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100",
                            children: "Cancelar"
                        }), (0,
                        o.jsx)("button", {
                            onClick: y,
                            className: "px-4 py-2 bg-black rounded-md text-white hover:bg-black/80 disabled:bg-gray-400",
                            disabled: 0 === u.length || p,
                            children: p ? "Enviando..." : "Enviar imagens"
                        })]
                    })]
                })
            }) : null
        }
          , c = t(83495)
          , m = t(86644)
          , u = e => {
            let {title: a, subtitle: t, isEditMode: l=!1, propertyName: i="", isAutomacao: s=!1} = e
              , n = (0,
            r.useRouter)()
              , d = s ? "/admin/automacao" : "/admin/imoveis";
            return (0,
            o.jsxs)("div", {
                className: "py-2 border-b border-gray-200",
                children: [(0,
                o.jsxs)("div", {
                    className: "flex items-center mb-2",
                    children: [(0,
                    o.jsx)("button", {
                        type: "button",
                        onClick: () => n.push(d),
                        className: "mr-2 p-1 rounded-full hover:bg-gray-100",
                        children: (0,
                        o.jsx)(m.Z, {
                            className: "h-4 w-4"
                        })
                    }), (0,
                    o.jsx)("h1", {
                        className: "text-lg font-semibold",
                        children: a || (l && i ? "Editar Im\xf3vel: ".concat(i) : "Cadastrar Novo Im\xf3vel")
                    })]
                }), t && (0,
                o.jsx)("p", {
                    className: "text-xs text-gray-500 mb-2",
                    children: t
                })]
            })
        }
          , g = t(99442)
          , p = t(64728)
          , b = (0,
        l.memo)(e => {
            let {isSaving: a, isValid: t=!0, isEditMode: l=!1, onCancel: i} = e
              , s = (0,
            r.useRouter)();
            return (0,
            o.jsxs)("div", {
                className: "flex justify-between items-center mt-6",
                children: [!t && (0,
                o.jsxs)("div", {
                    className: "flex items-center text-red-600",
                    children: [(0,
                    o.jsx)(g.Z, {
                        className: "w-4 h-4 mr-1"
                    }), (0,
                    o.jsx)("p", {
                        className: "text-xs",
                        children: "Preencha todos os campos obrigat\xf3rios e adicione pelo menos 5 fotos para cadastrar o im\xf3vel."
                    })]
                }), (0,
                o.jsxs)("div", {
                    className: "flex ml-auto",
                    children: [(0,
                    o.jsx)("button", {
                        type: "button",
                        onClick: i || ( () => s.push("/admin/automacao")),
                        className: "inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 mr-2",
                        children: "Cancelar"
                    }), (0,
                    o.jsx)("button", {
                        type: "submit",
                        disabled: a || !t,
                        className: "inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white \n            ".concat(a ? "bg-gray-500" : t ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"),
                        children: a ? (0,
                        o.jsxs)(o.Fragment, {
                            children: [(0,
                            o.jsx)(p.Z, {
                                className: "w-4 h-4 mr-1 animate-spin"
                            }), l ? "Atualizando..." : "Cadastrando..."]
                        }) : l ? "Atualizar Im\xf3vel" : "Cadastrar Im\xf3vel"
                    })]
                })]
            })
        }
        )
          , x = (0,
        l.memo)(e => {
            let {title: a, children: t, highlight: l=!1} = e;
            return (0,
            o.jsxs)("div", {
                className: "bg-white rounded-lg overflow-hidden p-5 ".concat(l ? "border-2 border-[#8B6F48]" : ""),
                children: [(0,
                o.jsx)("h2", {
                    className: "text-lg font-semibold mb-4 text-gray-800 border-b pb-2",
                    children: a
                }), t]
            })
        }
        )
          , v = (0,
        l.memo)(e => {
            let {isValid: a} = e;
            return (0,
            o.jsx)("span", {
                className: "text-[9px] ml-1 font-medium ".concat(a ? "text-green-500" : "text-red-500"),
                children: a ? "(obrigat\xf3rio)" : "preencher campo"
            })
        }
        )
          , h = (0,
        l.memo)(e => {
            let {field: a, value: t, displayValue: l, onChange: r, fullWidth: i=!1, isRequired: s=!1, isValid: n=!0} = e
              , {name: d, label: c, type: m, options: u, isMonetary: g, disabled: p, readOnly: b, className: x, placeholder: h, id: f} = a
              , y = f || d
              , N = "AreaPrivativa" === d || "AreaTotal" === d;
            return (0,
            o.jsxs)("div", {
                className: i ? "col-span-full" : "",
                children: [(0,
                o.jsxs)("label", {
                    htmlFor: y,
                    className: "block text-[10px] font-bold text-zinc-600 mb-1",
                    children: [c, s && (0,
                    o.jsx)(v, {
                        isValid: n
                    })]
                }), "textarea" === m ? (0,
                o.jsx)("textarea", {
                    id: y,
                    name: d,
                    value: t || "",
                    onChange: r,
                    rows: 4,
                    className: "border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ".concat(s && !n ? "border-red-300 bg-red-50" : "")
                }) : "select" === m ? (0,
                o.jsxs)("select", {
                    id: y,
                    name: d,
                    value: t || "",
                    onChange: r,
                    className: "border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ".concat(s && !n ? "border-red-300 bg-red-50" : ""),
                    children: [(0,
                    o.jsx)("option", {
                        value: "",
                        children: "Selecione uma op\xe7\xe3o"
                    }), null == u ? void 0 : u.map(e => (0,
                    o.jsx)("option", {
                        value: e.value,
                        children: e.label
                    }, "".concat(y, "-").concat(e.value)))]
                }) : g ? (0,
                o.jsx)("input", {
                    type: "text",
                    id: y,
                    name: d,
                    value: l || "",
                    onChange: r,
                    className: "border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ".concat(s && !n ? "border-red-300 bg-red-50" : ""),
                    placeholder: "R$ 0"
                }) : N ? (0,
                o.jsx)("input", {
                    type: "text",
                    id: y,
                    name: d,
                    value: t || "",
                    onChange: e => {
                        let {name: a, value: t} = e.target;
                        r({
                            target: {
                                name: a,
                                value: t.replace(/[^\d]/g, "").slice(0, 4)
                            }
                        })
                    }
                    ,
                    className: "border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ".concat(s && !n ? "border-red-300 bg-red-50" : "", " ").concat(x || ""),
                    placeholder: N ? "Ex: 120" : h || "",
                    disabled: p,
                    readOnly: b
                }) : (0,
                o.jsx)("input", {
                    type: m,
                    id: y,
                    name: d,
                    value: t || "",
                    onChange: r,
                    className: "border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ".concat(s && !n ? "border-red-300 bg-red-50" : "", " ").concat(x || ""),
                    placeholder: h || "",
                    disabled: p,
                    readOnly: b
                }), s && !n && (0,
                o.jsx)("p", {
                    className: "text-[10px] text-red-500 mt-1",
                    children: "Campo obrigat\xf3rio"
                })]
            })
        }
        );
        let f = ["Empreendimento", "Slug", "CEP", "Endereco", "Numero", "Bairro", "Cidade"];
        var y = (0,
        l.memo)(e => {
            let {fields: a, formData: t, displayValues: l, onChange: r, validation: i={}} = e
              , s = e => {
                if ("Video.1.Video" === e.name) {
                    var a, o;
                    return (null == t ? void 0 : null === (o = t.Video) || void 0 === o ? void 0 : null === (a = o[1]) || void 0 === a ? void 0 : a.Video) || ""
                }
                return t[e.name] || ""
            }
              , n = e => !i.fieldValidation || !1 !== i.fieldValidation[e];
            return (0,
            o.jsx)("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                children: a.map( (e, a) => (0,
                o.jsx)(h, {
                    field: e,
                    value: s(e),
                    displayValue: e.isMonetary ? l[e.name] : void 0,
                    onChange: r,
                    fullWidth: "textarea" === e.type,
                    isRequired: f.includes(e.name),
                    isValid: n(e.name)
                }, "".concat(e.name, "-").concat(a)))
            })
        }
        )
          , N = t(34785)
          , C = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l, validation: r} = e
              , i = (0,
            N.Z)(e => e.imovelSelecionado)
              , s = (null == i ? void 0 : i.Automacao) === !0;
            return (0,
            o.jsx)(x, {
                title: "Informa\xe7\xf5es B\xe1sicas",
                children: (0,
                o.jsx)(y, {
                    fields: [{
                        name: "Codigo",
                        label: s ? "C\xf3digo (Aut)" : "C\xf3digo",
                        type: "text",
                        disabled: !0,
                        className: s ? "bg-gray-100" : ""
                    }, {
                        name: "Ativo",
                        label: "Ativo",
                        type: "text",
                        disabled: !0
                    }, {
                        name: "TermoSeo",
                        label: "Termo SEO",
                        type: "text"
                    }, {
                        name: "Empreendimento",
                        label: "Empreendimento",
                        type: "text"
                    }, {
                        name: "Construtora",
                        label: "Construtora",
                        type: "text"
                    }, {
                        name: "Categoria",
                        label: "Categoria",
                        type: "select",
                        options: [{
                            value: "Apartamento",
                            label: "Apartamento"
                        }, {
                            value: "Casa",
                            label: "Casa"
                        }, {
                            value: "Casa Comercial",
                            label: "Casa Comercial"
                        }, {
                            value: "Casa em Condominio",
                            label: "Casa em Condominio"
                        }, {
                            value: "Cobertura",
                            label: "Cobertura"
                        }, {
                            value: "Flat",
                            label: "Flat"
                        }, {
                            value: "Garden",
                            label: "Garden"
                        }, {
                            value: "Loft",
                            label: "Loft"
                        }, {
                            value: "Loja",
                            label: "Loja"
                        }, {
                            value: "Pr\xe9dio Comercial",
                            label: "Pr\xe9dio Comercial"
                        }, {
                            value: "Sala Comercial",
                            label: "Sala Comercial"
                        }, {
                            value: "Terreno",
                            label: "Terreno"
                        }]
                    }, {
                        name: "Situacao",
                        label: "Situa\xe7\xe3o",
                        type: "select",
                        options: [{
                            value: "EM CONSTRU\xc7\xc3O",
                            label: "EM CONSTRU\xc7\xc3O"
                        }, {
                            value: "LAN\xc7AMENTO",
                            label: "LAN\xc7AMENTO"
                        }, {
                            value: "PR\xc9-LAN\xc7AMENTO",
                            label: "PR\xc9-LAN\xc7AMENTO"
                        }, {
                            value: "PRONTO NOVO",
                            label: "PRONTO NOVO"
                        }, {
                            value: "PRONTO USADO",
                            label: "PRONTO USADO"
                        }]
                    }, {
                        name: "Status",
                        label: "Status",
                        type: "select",
                        options: [{
                            value: "LOCA\xc7\xc3O",
                            label: "LOCA\xc7\xc3O"
                        }, {
                            value: "LOCADO",
                            label: "LOCADO"
                        }, {
                            value: "PENDENTE",
                            label: "PENDENTE"
                        }, {
                            value: "SUSPENSO",
                            label: "SUSPENSO"
                        }, {
                            value: "VENDA",
                            label: "VENDA"
                        }, {
                            value: "VENDA E LOCA\xc7\xc3O",
                            label: "VENDA E LOCA\xc7\xc3O"
                        }, {
                            value: "VENDIDO",
                            label: "VENDIDO"
                        }]
                    }, {
                        name: "Slug",
                        label: "Slug (Autom\xe1tico)",
                        type: "text",
                        disabled: !0,
                        readOnly: !0,
                        className: "bg-gray-100"
                    }, {
                        name: "Destacado",
                        label: "Im\xf3vel Destaque (Sim/N\xe3o)",
                        type: "select",
                        options: [{
                            value: "Sim",
                            label: "Sim"
                        }, {
                            value: "N\xe3o",
                            label: "N\xe3o"
                        }]
                    }, {
                        name: "Condominio",
                        label: "\xc9 Condom\xednio? ",
                        type: "select",
                        options: [{
                            value: "Sim",
                            label: "Sim"
                        }, {
                            value: "N\xe3o",
                            label: "N\xe3o"
                        }]
                    }, {
                        name: "CondominioDestaque",
                        label: "Condom\xednio Destaque",
                        type: "select",
                        options: [{
                            value: "Sim",
                            label: "Sim"
                        }, {
                            value: "N\xe3o",
                            label: "N\xe3o"
                        }]
                    }, {
                        name: "DataEntrega",
                        label: "Data de Entrega",
                        type: "text"
                    }, {
                        name: "LinkImovelOriginal",
                        label: "Link Parceiro",
                        type: "text"
                    }, {
                        name: "DataHoraAtualizacao",
                        label: "Data de Atualiza\xe7\xe3o",
                        type: "text",
                        disabled: !0
                    }, {
                        name: "Disponibilidade",
                        label: "Disponibilidade (Observa\xe7\xf5es)",
                        type: "textarea"
                    }],
                    formData: a,
                    displayValues: t,
                    onChange: l,
                    validation: r
                })
            })
        }
        );
        let j = [{
            name: "CEP",
            label: "CEP",
            type: "text"
        }, {
            name: "Endereco",
            label: "Endere\xe7o",
            type: "text"
        }, {
            name: "Numero",
            label: "N\xfamero",
            type: "text"
        }, {
            name: "Complemento",
            label: "Complemento",
            type: "text"
        }, {
            name: "Bairro",
            label: "Bairro",
            type: "text"
        }, {
            name: "BairroComercial",
            label: "Bairro Comercial",
            type: "text"
        }, {
            name: "Cidade",
            label: "Cidade",
            type: "text"
        }, {
            name: "UF",
            label: "UF",
            type: "text"
        }, {
            name: "Regiao",
            label: "Regi\xe3o",
            type: "text"
        }, {
            name: "Latitude",
            label: "Latitude",
            type: "text"
        }, {
            name: "Longitude",
            label: "Longitude",
            type: "text"
        }];
        var S = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l, validation: r} = e;
            return (0,
            o.jsx)(x, {
                title: "Localiza\xe7\xe3o",
                children: (0,
                o.jsx)(y, {
                    fields: j,
                    formData: a,
                    displayValues: t,
                    onChange: l,
                    validation: r
                })
            })
        }
        );
        let E = [{
            name: "AreaPrivativa",
            label: "\xc1rea Privativa (m\xb2)",
            type: "text"
        }, {
            name: "AreaTotal",
            label: "\xc1rea Total (m\xb2)",
            type: "text"
        }, {
            name: "DormitoriosAntigo",
            label: "Dormit\xf3rios",
            type: "text"
        }, {
            name: "SuiteAntigo",
            label: "Su\xedtes",
            type: "text"
        }, {
            name: "BanheiroSocialQtd",
            label: "Banheiros Sociais",
            type: "text"
        }, {
            name: "VagasAntigo",
            label: "Vagas de Garagem",
            type: "text"
        }];
        var w = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l} = e;
            return (0,
            o.jsx)(x, {
                title: "Caracter\xedsticas",
                children: (0,
                o.jsx)(y, {
                    fields: E,
                    formData: a,
                    displayValues: t,
                    onChange: l
                })
            })
        }
        );
        let A = [{
            name: "ValorAntigo",
            label: "Valor da Venda",
            type: "text",
            isMonetary: !0
        }, {
            name: "ValorAluguelSite",
            label: "Valor de Aluguel",
            type: "text",
            isMonetary: !0
        }, {
            name: "ValorCondominio",
            label: "Valor do Condom\xednio",
            type: "text",
            isMonetary: !0
        }, {
            name: "ValorIptu",
            label: "Valor do IPTU ",
            type: "text",
            isMonetary: !0
        }];
        var D = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l} = e;
            return (0,
            o.jsx)(x, {
                title: "Valores",
                children: (0,
                o.jsx)(y, {
                    fields: A,
                    formData: a,
                    displayValues: t,
                    onChange: l
                })
            })
        }
        )
          , V = t(71693);
        async function O() {
            try {
                let e = await V.Z.get("admin/corretores");
                return {
                    success: !0,
                    data: e.data
                }
            } catch (e) {
                return console.error("Erro ao buscar corretor:", e),
                {
                    success: !1,
                    message: "Erro ao buscar corretor",
                    data: {
                        nome: "",
                        email: "",
                        celular: ""
                    }
                }
            }
        }
        var I = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: r} = e
              , [i,s] = (0,
            l.useState)([]);
            (0,
            l.useEffect)( () => {
                (async () => {
                    if (!a.Corretor) {
                        var e, t;
                        s(null === (t = (await O()).data) || void 0 === t ? void 0 : null === (e = t.data) || void 0 === e ? void 0 : e.map( (e, a) => ({
                            value: e.nome,
                            label: e.nome
                        })))
                    }
                }
                )()
            }
            , []);
            let n = [a.Corretor ? {
                name: "Corretor",
                label: "Nome",
                type: "text",
                value: a.Corretor
            } : a.Corretor ? void 0 : {
                name: "Corretor",
                label: "Nome",
                type: "select",
                options: i
            }, {
                name: "EmailCorretor",
                label: "E-mail",
                type: "text"
            }, {
                name: "CelularCorretor",
                label: "Celular",
                type: "text"
            }, {
                name: "ImobParceiro",
                label: "Imobiliaria",
                type: "text"
            }, {
                name: "ImobiliariaObs",
                label: "Observa\xe7\xf5es",
                type: "textarea"
            }];
            return (0,
            o.jsx)(x, {
                title: "Corretores Vinculados (Imobili\xe1ria)",
                children: (0,
                o.jsx)(y, {
                    fields: n,
                    formData: a,
                    displayValues: t,
                    onChange: r
                })
            })
        }
        );
        let k = [{
            name: "DescricaoUnidades",
            label: "Descri\xe7\xe3o da Unidade",
            type: "textarea"
        }, {
            name: "DescricaoDiferenciais",
            label: "Sobre o Condom\xednio",
            type: "textarea"
        }, {
            name: "DestaquesLazer",
            label: "Destaques de Lazer",
            type: "textarea"
        }, {
            name: "DestaquesLocalizacao",
            label: "Destaques de Localiza\xe7\xe3o",
            type: "textarea"
        }, {
            name: "FichaTecnica",
            label: "Ficha T\xe9cnica",
            type: "textarea"
        }];
        var P = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l} = e;
            return (0,
            o.jsx)(x, {
                title: "Descri\xe7\xf5es",
                children: (0,
                o.jsx)(y, {
                    fields: k,
                    formData: a,
                    displayValues: t,
                    onChange: l
                })
            })
        }
        );
        let T = [{
            name: "Tour360",
            label: "Link do Tour Virtual 360\xb0",
            type: "text"
        }, {
            name: "Video.1.Video",
            label: "ID do V\xeddeo (YouTube)",
            type: "text",
            placeholder: "Ex: mdcsckJg7rc"
        }];
        var F = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: l} = e;
            return (0,
            o.jsx)(x, {
                title: "M\xeddia",
                children: (0,
                o.jsx)(y, {
                    fields: T,
                    formData: a,
                    displayValues: t,
                    onChange: l
                })
            })
        }
        );
        let L = (0,
        l.memo)(e => {
            let {formData: a, addSingleImage: t, showImageModal: l, updateImage: r, removeImage: i, removeAllImages: n, downloadAllPhotos: d, downloadingPhotos: c, setImageAsHighlight: m, changeImagePosition: u, validation: g} = e
              , p = e => {
                let a = document.createElement("input");
                a.type = "file",
                a.accept = "image/*",
                a.onchange = a => {
                    var t;
                    let o = null === (t = a.target.files) || void 0 === t ? void 0 : t[0];
                    if (o) {
                        let a = new FileReader;
                        a.onload = a => {
                            r(e, a.target.result)
                        }
                        ,
                        a.readAsDataURL(o)
                    }
                }
                ,
                a.click()
            }
              , b = (e, t) => {
                var o;
                let l = parseInt(t);
                !isNaN(l) && l > 0 && l <= (null === (o = a.Foto) || void 0 === o ? void 0 : o.length) && u(e, l)
            }
              , v = a.Foto ? [...a.Foto].sort( (e, t) => (e.Ordem || a.Foto.indexOf(e) + 1) - (t.Ordem || a.Foto.indexOf(t) + 1)) : [];
            return (0,
            o.jsx)(x, {
                title: "Imagens do Im\xf3vel",
                className: "mb-8",
                children: (0,
                o.jsxs)("div", {
                    className: "space-y-4",
                    children: [(0,
                    o.jsxs)("div", {
                        className: "flex flex-wrap justify-between items-center gap-3",
                        children: [(0,
                        o.jsxs)("div", {
                            className: "text-sm",
                            children: [(0,
                            o.jsxs)("span", {
                                className: "font-medium text-gray-700",
                                children: [g.photoCount, "/", g.requiredPhotoCount, " fotos"]
                            }), g.photoCount < g.requiredPhotoCount && (0,
                            o.jsxs)("span", {
                                className: "text-red-500 ml-2",
                                children: ["(M\xednimo ", g.requiredPhotoCount, ")"]
                            })]
                        }), (0,
                        o.jsxs)("div", {
                            className: "flex flex-wrap gap-2",
                            children: [(0,
                            o.jsx)("button", {
                                type: "button",
                                onClick: () => {
                                    let e = prompt("Digite a URL da imagem:");
                                    (null == e ? void 0 : e.trim()) && t(e.trim())
                                }
                                ,
                                className: "px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors",
                                children: "+ Adicionar URL"
                            }), (0,
                            o.jsx)("button", {
                                type: "button",
                                onClick: l,
                                className: "px-3 py-1.5 text-sm bg-black hover:bg-gray-800 text-white rounded-md transition-colors",
                                children: "\uD83D\uDCE4 Upload em Lote"
                            }), v.length > 0 && (0,
                            o.jsxs)(o.Fragment, {
                                children: [(0,
                                o.jsx)("button", {
                                    type: "button",
                                    onClick: d,
                                    disabled: c,
                                    className: "px-3 py-1.5 text-sm rounded-md transition-colors ".concat(c ? "bg-blue-300 text-white cursor-wait" : "bg-blue-600 hover:bg-blue-700 text-white"),
                                    children: c ? "Baixando..." : "⬇️ Baixar Todas"
                                }), (0,
                                o.jsx)("button", {
                                    type: "button",
                                    onClick: n,
                                    className: "px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors",
                                    children: "\uD83D\uDDD1️ Limpar Tudo"
                                })]
                            })]
                        })]
                    }), v.length > 0 ? (0,
                    o.jsx)("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: v.map( (e, a) => (0,
                        o.jsxs)("div", {
                            className: "border rounded-lg overflow-hidden bg-white shadow-sm",
                            children: [(0,
                            o.jsxs)("div", {
                                className: "relative aspect-video w-full",
                                children: [(0,
                                o.jsx)(s.default, {
                                    src: e.Foto,
                                    alt: "Im\xf3vel ".concat(a + 1),
                                    fill: !0,
                                    className: "object-cover",
                                    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                }), "Sim" === e.Destaque && (0,
                                o.jsx)("span", {
                                    className: "absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded",
                                    children: "DESTAQUE"
                                })]
                            }), (0,
                            o.jsxs)("div", {
                                className: "p-3 space-y-3",
                                children: [(0,
                                o.jsxs)("div", {
                                    className: "flex gap-2",
                                    children: [(0,
                                    o.jsxs)("div", {
                                        className: "flex-1",
                                        children: [(0,
                                        o.jsx)("label", {
                                            className: "block text-xs text-gray-500 mb-1",
                                            children: "Ordem"
                                        }), (0,
                                        o.jsx)("select", {
                                            value: e.Ordem || a + 1,
                                            onChange: a => b(e.Codigo, a.target.value),
                                            className: "w-full p-1.5 text-sm border rounded-md bg-gray-50",
                                            children: [...Array(v.length)].map( (e, a) => (0,
                                            o.jsx)("option", {
                                                value: a + 1,
                                                children: a + 1
                                            }, a + 1))
                                        })]
                                    }), (0,
                                    o.jsxs)("div", {
                                        className: "flex-1",
                                        children: [(0,
                                        o.jsx)("label", {
                                            className: "block text-xs text-gray-500 mb-1",
                                            children: "A\xe7\xe3o"
                                        }), (0,
                                        o.jsx)("button", {
                                            onClick: () => m(e.Codigo),
                                            className: "w-full p-1.5 text-sm rounded-md transition-colors ".concat("Sim" === e.Destaque ? "bg-yellow-500 text-white" : "bg-gray-100 hover:bg-gray-200"),
                                            children: "Sim" === e.Destaque ? "★ Destaque" : "☆ Tornar Destaque"
                                        })]
                                    })]
                                }), (0,
                                o.jsxs)("div", {
                                    className: "flex gap-2",
                                    children: [(0,
                                    o.jsx)("button", {
                                        type: "button",
                                        onClick: () => p(e.Codigo),
                                        className: "flex-1 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors",
                                        children: "\uD83D\uDD04 Trocar"
                                    }), (0,
                                    o.jsx)("button", {
                                        type: "button",
                                        onClick: () => i(e.Codigo),
                                        className: "flex-1 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors",
                                        children: "✖ Remover"
                                    })]
                                })]
                            })]
                        }, "".concat(e.Codigo, "-").concat(a)))
                    }) : (0,
                    o.jsxs)("div", {
                        className: "text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200",
                        children: [(0,
                        o.jsx)("p", {
                            className: "text-gray-500",
                            children: "Nenhuma imagem cadastrada"
                        }), (0,
                        o.jsx)("p", {
                            className: "text-sm text-gray-400 mt-1",
                            children: "Utilize os bot\xf5es acima para adicionar imagens"
                        })]
                    }), g.photoCount < g.requiredPhotoCount && (0,
                    o.jsx)("div", {
                        className: "bg-yellow-50 border-l-4 border-yellow-400 p-3",
                        children: (0,
                        o.jsxs)("p", {
                            className: "text-yellow-700 text-sm",
                            children: ["⚠️ Adicione pelo menos ", g.requiredPhotoCount, " fotos para publicar"]
                        })
                    })]
                })
            })
        }
        );
        L.displayName = "ImagesSection";
        var U = t(33814)
          , R = t(78285)
          , M = function() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
              , [a,t] = (0,
            l.useState)({
                Titulo: "",
                Descricao: "",
                TipoImovel: "Apartamento",
                Finalidade: "VENDA",
                ValorVenda: 0,
                ValorAluguel: 0,
                ValorCondominio: 0,
                ValorIPTU: 0,
                AreaUtil: 0,
                AreaTotal: 0,
                Quartos: 0,
                Suites: 0,
                Banheiros: 0,
                VagasGaragem: 0,
                AnoConstrucao: "",
                Status: "Disponivel",
                Endereco: "",
                Numero: "",
                Complemento: "",
                Bairro: "",
                Cidade: "",
                Estado: "",
                CEP: "",
                Latitude: "",
                Longitude: "",
                Destaque: "Nao",
                Ativo: "Sim",
                DataCadastro: new Date().toISOString().split("T")[0],
                Corretor: "",
                Imobiliaria: "",
                Observacoes: "",
                Foto: [],
                Caracteristicas: [],
                Proximidades: [],
                InformacoesAdicionais: [],
                ...e
            })
              , [o,r] = (0,
            l.useState)({
                Titulo: !0,
                Descricao: !0,
                TipoImovel: !0,
                Finalidade: !0,
                ValorVenda: !0,
                ValorAluguel: !0,
                ValorCondominio: !0,
                ValorIPTU: !0,
                AreaUtil: !0,
                AreaTotal: !0,
                Quartos: !0,
                Suites: !0,
                Banheiros: !0,
                VagasGaragem: !0,
                AnoConstrucao: !0,
                Status: !0,
                Endereco: !0,
                Numero: !0,
                Bairro: !0,
                Cidade: !0,
                Estado: !0,
                CEP: !0,
                Corretor: !0,
                Imobiliaria: !0,
                Foto: !0
            });
            return (0,
            l.useEffect)( () => {
                e && Object.keys(e).length > 0 && t(a => ({
                    ...a,
                    ...e,
                    ValorVenda: (0,
                    R.formatarMoedaParaNumero)(e.ValorVenda),
                    ValorAluguel: (0,
                    R.formatarMoedaParaNumero)(e.ValorAluguel),
                    ValorCondominio: (0,
                    R.formatarMoedaParaNumero)(e.ValorCondominio),
                    ValorIPTU: (0,
                    R.formatarMoedaParaNumero)(e.ValorIPTU)
                }))
            }
            , [e]),
            {
                formData: a,
                setFormData: t,
                handleChange: e => {
                    let {name: a, value: o, type: l, checked: i} = e.target;
                    if (["ValorVenda", "ValorAluguel", "ValorCondominio", "ValorIPTU"].includes(a)) {
                        let e = o.replace(/[^0-9,]/g, "").replace(",", ".");
                        t(t => ({
                            ...t,
                            [a]: parseFloat(e) || 0
                        }))
                    } else
                        "checkbox" === l ? t(e => ({
                            ...e,
                            [a]: i ? "Sim" : "Nao"
                        })) : t(e => ({
                            ...e,
                            [a]: o
                        }));
                    r(e => ({
                        ...e,
                        [a]: !0
                    }))
                }
                ,
                handleCaracteristicaChange: e => {
                    t(a => ({
                        ...a,
                        Caracteristicas: e.map(e => e.value)
                    }))
                }
                ,
                handleProximidadeChange: e => {
                    t(a => ({
                        ...a,
                        Proximidades: e.map(e => e.value)
                    }))
                }
                ,
                handleInformacoesAdicionaisChange: e => {
                    t(a => ({
                        ...a,
                        InformacoesAdicionais: e.map(e => e.value)
                    }))
                }
                ,
                addSingleImage: e => {
                    t(a => ({
                        ...a,
                        Foto: [...a.Foto, e]
                    }))
                }
                ,
                updateImage: (e, a) => {
                    t(t => {
                        let o = [...t.Foto];
                        return o[e] = a,
                        {
                            ...t,
                            Foto: o
                        }
                    }
                    )
                }
                ,
                removeImage: e => {
                    t(a => ({
                        ...a,
                        Foto: a.Foto.filter(a => a.Foto !== e)
                    }))
                }
                ,
                setImageAsHighlight: e => {
                    t(a => ({
                        ...a,
                        Foto: a.Foto.map(a => a.Foto === e ? {
                            ...a,
                            Destaque: "Sim"
                        } : {
                            ...a,
                            Destaque: "Nao"
                        })
                    }))
                }
                ,
                changeImagePosition: (e, a) => {
                    t(t => {
                        let o = [...t.Foto]
                          , [l] = o.splice(e, 1);
                        return o.splice(a, 0, l),
                        {
                            ...t,
                            Foto: o
                        }
                    }
                    )
                }
                ,
                validateForm: () => {
                    let e = {
                        ...o
                    }
                      , t = !0;
                    return ["Titulo", "Descricao", "TipoImovel", "Finalidade", "Endereco", "Numero", "Bairro", "Cidade", "Estado", "CEP", "Corretor", "Imobiliaria"].forEach(o => {
                        a[o] && "" !== String(a[o]).trim() || (e[o] = !1,
                        t = !1)
                    }
                    ),
                    ["ValorVenda", "ValorAluguel", "ValorCondominio", "ValorIPTU", "AreaUtil", "AreaTotal", "Quartos", "Suites", "Banheiros", "VagasGaragem"].forEach(o => {
                        (isNaN(a[o]) || a[o] < 0) && (e[o] = !1,
                        t = !1)
                    }
                    ),
                    (!a.Foto || a.Foto.length < 5) && (e.Foto = !1,
                    t = !1,
                    U.Am.error("\xc9 necess\xe1rio adicionar pelo menos 5 fotos.")),
                    r(e),
                    t
                }
                ,
                validation: o
            }
        }
          , z = t(36823)
          , B = t(57762)
          , q = t(59361)
          , _ = function(e, a) {
            let t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "create"
              , o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null
              , [r,i] = (0,
            l.useState)(!1)
              , [s,n] = (0,
            l.useState)("")
              , [d,c] = (0,
            l.useState)("")
              , m = (0,
            l.useCallback)(e => {
                let a = [{
                    field: "Empreendimento",
                    label: "Empreendimento"
                }, {
                    field: "Slug",
                    label: "Slug"
                }, {
                    field: "CEP",
                    label: "CEP"
                }, {
                    field: "Endereco",
                    label: "Endere\xe7o"
                }, {
                    field: "Numero",
                    label: "N\xfamero"
                }, {
                    field: "Bairro",
                    label: "Bairro"
                }, {
                    field: "Cidade",
                    label: "Cidade"
                }].filter(a => !e[a.field] || "" === e[a.field].trim());
                if (a.length > 0) {
                    let e = a.map(e => e.label).join(", ");
                    return {
                        isValid: !1,
                        error: "Campos obrigat\xf3rios n\xe3o preenchidos: ".concat(e)
                    }
                }
                let t = e.Foto ? Object.keys(e.Foto).length : 0;
                return t < 5 ? {
                    isValid: !1,
                    error: "\xc9 necess\xe1rio adicionar pelo menos 5 fotos (atualmente: ".concat(t, ")")
                } : {
                    isValid: !0
                }
            }
            , [])
              , u = (0,
            l.useCallback)(e => {
                let a = e.Foto ? Object.values(e.Foto) : []
                  , t = [];
                return e.Video && ("object" != typeof e.Video || Array.isArray(e.Video) ? Array.isArray(e.Video) && (t = e.Video) : t = Object.values(e.Video)),
                {
                    ...e,
                    ValorAntigo: e.ValorAntigo ? (0,
                    R.T)(e.ValorAntigo) : void 0,
                    TipoEndereco: function(e) {
                        if (!e || "string" != typeof e)
                            return "";
                        for (let a of ["Rua", "Avenida", "Alameda", "Travessa", "Estrada", "Pra\xe7a", "Rodovia", "Vila", "Largo", "Viela"])
                            if (e.trim().startsWith(a))
                                return a;
                        return e.trim().split(" ")[0]
                    }(e.Endereco),
                    Endereco: function(e) {
                        if (!e)
                            return "";
                        let a = RegExp("^(".concat("Rua|R.|Avenida|Av.|Alameda|Al.|Travessa|Tv.|Estrada|Est.|Pra\xe7a|P\xe7.|Rodovia|Rod.|Viela|Beco|Largo", ")\\s+"), "i");
                        return e.replace(a, "").trim()
                    }(e.Endereco),
                    Foto: a,
                    Video: t.length > 0 ? t : void 0
                }
            }
            , []);
            return {
                handleSubmit: (0,
                l.useCallback)(async l => {
                    l.preventDefault(),
                    i(!0),
                    n(""),
                    c("");
                    let r = m(e);
                    if (!r.isValid) {
                        n(r.error),
                        i(!1);
                        return
                    }
                    try {
                        let l;
                        let r = u(e);
                        if (e.Automacao) {
                            if ((l = await (0,
                            z.kg)(e.Codigo, r)) && l.success) {
                                c("Im\xf3vel cadastrado com sucesso!"),
                                a(!0);
                                try {
                                    let {user: a, timestamp: t} = await (0,
                                    q.t)();
                                    await (0,
                                    B.y)({
                                        user: a.displayName ? a.displayName : "N\xe3o Identificado",
                                        email: a.email,
                                        data: t.toISOString(),
                                        action: "Automa\xe7\xe3o:  ".concat(a.email, " - criou o im\xf3vel ").concat(e.Codigo, " a partir da automa\xe7\xe3o")
                                    })
                                } catch (a) {
                                    await (0,
                                    B.y)({
                                        user: user.displayName ? user.displayName : "N\xe3o Identificado",
                                        email: user.email,
                                        data: timestamp.toISOString(),
                                        action: "Automa\xe7\xe3o: Erro ao criar automa\xe7\xe3o: ".concat(user.email, " - im\xf3vel ").concat(e.Codigo, " c\xf3digo de erro: ").concat(a)
                                    })
                                }
                            } else
                                n((null == l ? void 0 : l.message) || "Erro ao criar im\xf3vel")
                        }
                        if ("edit" === t) {
                            l = await (0,
                            z.Bs)(o, r);
                            try {
                                let {user: a, timestamp: t} = await (0,
                                q.t)();
                                await (0,
                                B.y)({
                                    user: a.displayName ? a.displayName : "N\xe3o Identificado",
                                    email: a.email,
                                    data: t.toISOString(),
                                    action: "Usu\xe1rio ".concat(a.email, " atualizou o im\xf3vel ").concat(e.Codigo)
                                })
                            } catch (a) {
                                await (0,
                                B.y)({
                                    user: user.displayName ? user.displayName : "N\xe3o Identificado",
                                    email: user.email,
                                    data: timestamp.toISOString(),
                                    action: "Im\xf3veis: Erro ao editar im\xf3vel: ".concat(user.email, " -  im\xf3vel ").concat(e.Codigo, " c\xf3digo de erro: ").concat(a)
                                })
                            }
                            l && l.success ? (c("Im\xf3vel atualizado com sucesso!"),
                            a(!0)) : n((null == l ? void 0 : l.message) || "Erro ao atualizar im\xf3vel")
                        } else if ((l = await (0,
                        z.kg)(e.Codigo, r)) && l.success) {
                            c("Im\xf3vel cadastrado com sucesso!"),
                            a(!0);
                            try {
                                let {user: a, timestamp: t} = await (0,
                                q.t)();
                                await (0,
                                B.y)({
                                    user: a.displayName,
                                    email: a.email,
                                    data: t.toISOString(),
                                    action: "Usu\xe1rio ".concat(a.email, " atualizou o im\xf3vel ").concat(e.Codigo)
                                })
                            } catch (a) {
                                await (0,
                                B.y)({
                                    user: user.displayName ? user.displayName : "N\xe3o Identificado",
                                    email: user.email,
                                    data: timestamp.toISOString(),
                                    action: "Im\xf3veis: Erro ao criar im\xf3vel: ".concat(user.email, " -  im\xf3vel ").concat(e.Codigo, " c\xf3digo de erro: ").concat(a)
                                })
                            }
                        } else
                            n((null == l ? void 0 : l.message) || "Erro ao cadastrar im\xf3vel")
                    } catch (e) {
                        console.error("Erro ao ".concat("edit" === t ? "atualizar" : "cadastrar", " im\xf3vel:"), e),
                        n("Ocorreu um erro ao ".concat("edit" === t ? "atualizar" : "cadastrar", " o im\xf3vel"))
                    } finally {
                        i(!1)
                    }
                }
                , [e, a, m, u, t]),
                isSaving: r,
                error: s,
                success: d,
                setError: n,
                setSuccess: c
            }
        }
          , Z = (e, a, t) => ({
            handleImagesUploaded: (0,
            l.useCallback)(e => {
                console.log("Esta fun\xe7\xe3o est\xe1 obsoleta, usar handleImagesUploaded de useImovelForm"),
                e && e.length && (a("".concat(e.length, " imagem(ns) enviada(s) com sucesso!")),
                setTimeout( () => {
                    a("")
                }
                , 3e3))
            }
            , [a]),
            handleFileUpload: (0,
            l.useCallback)(async (o, l) => {
                try {
                    e(o, "isUploading", !0);
                    let t = await (0,
                    n.z)(l);
                    if (await (0,
                    n.p)(t))
                        e(o, "Foto", t.fileUrl),
                        e(o, "isUploading", !1),
                        a("Imagem enviada com sucesso para o Amazon S3!"),
                        setTimeout( () => {
                            a("")
                        }
                        , 3e3);
                    else
                        throw Error("Falha ao fazer upload da imagem")
                } catch (a) {
                    console.error("Erro no upload:", a),
                    t("Erro ao fazer upload da imagem: " + a.message),
                    e(o, "isUploading", !1)
                }
            }
            , [e, a, t])
        })
          , G = t(79367);
        let W = e => {
            if (null == e || "" === e)
                return "";
            let a = String(e).replace(/\D/g, "");
            try {
                return parseInt(a, 10).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })
            } catch (a) {
                return console.error("Erro ao formatar valor:", a),
                String(e)
            }
        }
        ;
        var J = t(32785);
        let K = e => {
            let {label: a, name: t, value: l, onChange: r, type: i="text", disabled: s, rows: n} = e;
            return (0,
            o.jsxs)("div", {
                className: n ? "col-span-full" : "",
                children: [(0,
                o.jsx)("label", {
                    className: "block text-xs font-medium text-gray-700 mb-1",
                    children: a
                }), n ? (0,
                o.jsx)("textarea", {
                    name: t,
                    value: l,
                    onChange: r,
                    rows: n,
                    className: "text-xs border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black",
                    disabled: s
                }) : (0,
                o.jsx)("input", {
                    type: i,
                    name: t,
                    value: l,
                    onChange: r,
                    className: "text-xs border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black",
                    disabled: s
                })]
            })
        }
          , Q = [{
            name: "nome",
            label: "Nome"
        }, {
            name: "fone",
            label: "Fone"
        }, {
            name: "email",
            label: "Email",
            type: "email"
        }, {
            name: "unidade",
            label: "Unidade"
        }, {
            name: "metrag",
            label: "Metragem"
        }, {
            name: "valor",
            label: "Valor"
        }, {
            name: "data",
            label: "Data"
        }, {
            name: "observacoes",
            label: "Observa\xe7\xf5es",
            rows: 4
        }]
          , H = e => {
            let {index: a, isActive: t, onClick: l} = e;
            return (0,
            o.jsxs)("button", {
                type: "button",
                onClick: l,
                className: "px-4 py-2 font-medium border-b-2 transition-colors duration-200 focus:outline-none ".concat(t ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"),
                children: ["Propriet\xe1rio ", a + 1]
            })
        }
          , Y = e => {
            let {feedback: a} = e;
            return a ? (0,
            o.jsx)("div", {
                className: "mb-4 p-3 rounded ".concat("success" === a.type ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"),
                children: a.message
            }) : null
        }
        ;
        function $(e) {
            let {id: a} = e
              , t = (e, a) => {
                let t = String(e + 1).padStart(2, "0");
                return ({
                    nome: "NOME".concat(t),
                    fone: "FONE_P".concat(t),
                    email: "EMAIL_".concat(t),
                    unidade: "UNIDADE_".concat(t),
                    metrag: "M2_".concat(t),
                    valor: "VALORP_".concat(t),
                    data: "DATAP_".concat(t),
                    observacoes: "OBS_P".concat(t)
                })[a]
            }
              , r = {};
            Array.from({
                length: 5
            }).forEach( (e, a) => {
                Q.forEach(e => {
                    let {name: o} = e;
                    r[t(a, o)] = ""
                }
                )
            }
            );
            let[i,s] = (0,
            l.useState)(r)
              , [n,d] = (0,
            l.useState)(0)
              , [c,m] = (0,
            l.useState)(!1)
              , [u,g] = (0,
            l.useState)(null)
              , [p,b] = (0,
            l.useState)(!1);
            (0,
            l.useEffect)( () => {
                (async () => {
                    let e = await (0,
                    J.wJ)(a);
                    e && e.success && e.data && e.data && "object" == typeof e.data && Object.keys(e.data).length > 0 && Object.values(e.data).some(e => null != e && "" !== e.toString().trim()) ? (s(e.data),
                    b(!0)) : b(!1)
                }
                )()
            }
            , [a]);
            let x = (0,
            l.useMemo)( () => Array.from({
                length: 5
            }, (e, a) => {
                let o = {};
                return Q.forEach(e => {
                    let {name: l} = e;
                    o[l] = i[t(a, l)] || ""
                }
                ),
                o
            }
            ), [i])
              , v = (e, a) => {
                let {name: o, value: l} = a.target
                  , r = t(e, o);
                s(e => ({
                    ...e,
                    [r]: l
                }))
            }
            ;
            (0,
            l.useMemo)( () => Object.values(i).some(e => e && "" !== e.toString().trim()), [i]);
            let h = async e => {
                e && e.preventDefault(),
                m(!0),
                g(null);
                try {
                    let e;
                    p ? e = await (0,
                    J.F1)(a, i) : (e = await (0,
                    J.fd)(a, i)).success && b(!0),
                    g({
                        type: e.success ? "success" : "error",
                        message: e.message || (e.success ? "Dados salvos com sucesso!" : "Erro ao salvar dados.")
                    })
                } catch (e) {
                    g({
                        type: "error",
                        message: "Erro inesperado ao salvar dados."
                    })
                } finally {
                    m(!1)
                }
            }
            ;
            return (0,
            o.jsxs)("div", {
                className: "bg-white rounded-lg overflow-hidden p-5 border-2 border-[#8B6F48]",
                children: [(0,
                o.jsx)("h2", {
                    className: "text-lg font-semibold mb-4 text-gray-800 border-b pb-2",
                    children: "Informa\xe7\xf5es dos Propriet\xe1rios"
                }), (0,
                o.jsx)("div", {
                    className: "flex space-x-2 mb-6 border-b",
                    children: Array.from({
                        length: 5
                    }).map( (e, a) => (0,
                    o.jsx)(H, {
                        index: a,
                        isActive: n === a,
                        onClick: () => d(a)
                    }, "prop-tab-".concat(a)))
                }), (0,
                o.jsx)(Y, {
                    feedback: u
                }), (0,
                o.jsxs)("div", {
                    className: "mb-6 border-b pb-4",
                    children: [(0,
                    o.jsxs)("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [(0,
                        o.jsxs)("h2", {
                            className: "font-bold",
                            children: ["Propriet\xe1rio ", n + 1]
                        }), (0,
                        o.jsx)("span", {
                            className: "text-xs px-2 py-1 rounded ".concat(p ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"),
                            children: p ? "Existente" : "Novo"
                        })]
                    }), (0,
                    o.jsx)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: Q.map(e => {
                            let {name: a, label: t, type: l, rows: r} = e;
                            return (0,
                            o.jsx)(K, {
                                label: t,
                                name: a,
                                type: l,
                                rows: r,
                                value: x[n][a],
                                onChange: e => v(n, e),
                                disabled: c
                            }, "prop-".concat(n, "-").concat(a))
                        }
                        )
                    })]
                }), (0,
                o.jsx)("div", {
                    className: "flex justify-end mt-8",
                    children: (0,
                    o.jsx)("button", {
                        type: "button",
                        onClick: h,
                        className: "bg-black hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out",
                        disabled: c,
                        children: c ? "Salvando..." : "Salvar"
                    })
                })]
            })
        }
        async function X() {
            let e = 0;
            for (; e < 50; ) {
                let t = Math.floor(1e5 + 9e5 * Math.random()).toString();
                try {
                    var a;
                    let e = await V.Z.get("idgenerate?codigo=".concat(t));
                    if ((null == e ? void 0 : null === (a = e.data) || void 0 === a ? void 0 : a.exists) === !1)
                        return t
                } catch (e) {}
                e++
            }
            throw Error("N\xe3o foi poss\xedvel gerar um c\xf3digo \xfanico de 6 d\xedgitos ap\xf3s v\xe1rias tentativas.")
        }
        var ee = (0,
        l.memo)(e => {
            let {formData: a, displayValues: t, onChange: i, validation: s} = e
              , [n,d] = (0,
            l.useState)(!1)
              , [m,u] = (0,
            l.useState)("")
              , [g,p] = (0,
            l.useState)("")
              , [b,v] = (0,
            l.useState)(!1)
              , [h,f] = (0,
            l.useState)("")
              , [C,j] = (0,
            l.useState)("");
            (0,
            r.useRouter)();
            let S = (0,
            l.useId)()
              , [E,w] = (0,
            l.useState)("")
              , [A,D] = (0,
            l.useState)({})
              , [V,O] = (0,
            l.useState)({})
              , I = (0,
            N.Z)(e => e.imovelSelecionado);
            null == I || I.Automacao;
            let k = [{
                name: "Ativo",
                label: "Ativo",
                type: "select",
                options: [{
                    value: "Sim",
                    label: "Sim"
                }, {
                    value: "N\xe3o",
                    label: "N\xe3o"
                }]
            }, {
                name: "Categoria",
                label: "Categoria",
                type: "select",
                options: [{
                    value: "Apartamento",
                    label: "Apartamento"
                }, {
                    value: "Casa",
                    label: "Casa"
                }, {
                    value: "Casa Comercial",
                    label: "Casa Comercial"
                }, {
                    value: "Casa em Condominio",
                    label: "Casa em Condominio"
                }, {
                    value: "Cobertura",
                    label: "Cobertura"
                }, {
                    value: "Flat",
                    label: "Flat"
                }, {
                    value: "Garden",
                    label: "Garden"
                }, {
                    value: "Loft",
                    label: "Loft"
                }, {
                    value: "Loja",
                    label: "Loja"
                }, {
                    value: "Pr\xe9dio Comercial",
                    label: "Pr\xe9dio Comercial"
                }, {
                    value: "Sala Comercial",
                    label: "Sala Comercial"
                }, {
                    value: "Terreno",
                    label: "Terreno"
                }]
            }, {
                name: "Situacao",
                label: "Situa\xe7\xe3o",
                type: "select",
                options: [{
                    value: "EM CONSTRU\xc7\xc3O",
                    label: "EM CONSTRU\xc7\xc3O"
                }, {
                    value: "LAN\xc7AMENTO",
                    label: "LAN\xc7AMENTO"
                }, {
                    value: "PR\xc9-LAN\xc7AMENTO",
                    label: "PR\xc9-LAN\xc7AMENTO"
                }, {
                    value: "PRONTO NOVO",
                    label: "PRONTO NOVO"
                }, {
                    value: "PRONTO USADO",
                    label: "PRONTO USADO"
                }]
            }, {
                name: "Status",
                label: "Status",
                type: "select",
                options: [{
                    value: "LOCA\xc7\xc3O",
                    label: "LOCA\xc7\xc3O"
                }, {
                    value: "LOCADO",
                    label: "LOCADO"
                }, {
                    value: "PENDENTE",
                    label: "PENDENTE"
                }, {
                    value: "SUSPENSO",
                    label: "SUSPENSO"
                }, {
                    value: "VENDA",
                    label: "VENDA"
                }, {
                    value: "VENDA E LOCA\xc7\xc3O",
                    label: "VENDA E LOCA\xc7\xc3O"
                }, {
                    value: "VENDIDO",
                    label: "VENDIDO"
                }]
            }, {
                name: "ValorAntigo",
                label: "Valor Venda",
                type: "text",
                isMonetary: !0
            }, {
                name: "ValorAluguelSite",
                label: "Valor de Aluguel",
                type: "text",
                isMonetary: !0
            }, {
                name: "AreaPrivativa",
                label: "\xc1rea Privativa (m\xb2)",
                type: "text"
            }, {
                name: "AreaTotal",
                label: "\xc1rea Total (m\xb2)",
                type: "text"
            }, {
                name: "DormitoriosAntigo",
                label: "Dormit\xf3rios",
                type: "text"
            }, {
                name: "SuitesAntigo",
                label: "Su\xedtes",
                type: "text"
            }, {
                name: "BanheiroSocialQtd",
                label: "Banheiros Sociais",
                type: "text"
            }, {
                name: "VagasAntigo",
                label: "Vagas de Garagem",
                type: "text"
            }]
              , P = async () => {
                d(!0),
                u(""),
                p("");
                try {
                    let e = await X()
                      , a = {
                        ...I,
                        Codigo: e,
                        Condominio: "N\xe3o",
                        _id: void 0
                    };
                    if (k.forEach(e => {
                        void 0 !== A[e.name] && "" !== A[e.name] && ("ValorAntigo" === e.name || "ValorAluguelSite" === e.name ? a[e.name] = (0,
                        R.T)(A[e.name]) : a[e.name] = A[e.name])
                    }
                    ),
                    a.Slug && a.Categoria && a.AreaPrivativa) {
                        let t = a.Categoria.toLowerCase().replace(/\s+/g, "-")
                          , o = a.AreaPrivativa.toLowerCase().replace(/\s+/g, "-");
                        a.Slug = "".concat(t, "-").concat(o, "-metros-").concat(a.Slug, "-").concat(e),
                        w(a.Slug)
                    }
                    if (e) {
                        let t = await (0,
                        z.kg)(e, a);
                        t && t.success ? (p("Im\xf3vel cadastrado com sucesso! C\xf3digo: ".concat(e, ". Acesse no link: https://npiconsultoria.com.br/imovel-").concat(e, "/").concat(a.Slug)),
                        f(e),
                        j(a.Empreendimento || "Novo Im\xf3vel"),
                        v(!0)) : u((null == t ? void 0 : t.message) || "Erro ao cadastrar im\xf3vel relacionado")
                    }
                } catch (e) {
                    console.error("Erro ao cadastrar im\xf3vel relacionado:", e),
                    u("Ocorreu um erro ao cadastrar o im\xf3vel relacionado")
                } finally {
                    d(!1)
                }
            }
            ;
            return (0,
            o.jsxs)(x, {
                title: "Cadastrar novo im\xf3vel",
                highlight: !0,
                children: [b && (0,
                o.jsx)(c.Z, {
                    title: "Im\xf3vel Cadastrado com Sucesso",
                    description: "".concat(A.Categoria || "Im\xf3vel", " em ").concat(C, " com ").concat(A.AreaPrivativa || "\xe1rea n\xe3o informada", "m\xb2 cadastrado com sucesso com o c\xf3digo ").concat(h, ". Ele agora est\xe1 dispon\xedvel na lista de im\xf3veis do site."),
                    buttonText: "Ver no site",
                    link: "/imovel-".concat(h, "/").concat(E),
                    onClose: () => {
                        v(!1),
                        setTimeout( () => {
                            D({}),
                            O({}),
                            u(""),
                            p("")
                        }
                        , 2e3)
                    }
                }), (0,
                o.jsx)(y, {
                    fields: k.map( (e, a) => ({
                        ...e,
                        id: "vincular-".concat(S, "-").concat(e.name, "-").concat(a)
                    })),
                    formData: A,
                    displayValues: V,
                    onChange: e => {
                        let {name: a, value: t} = e.target
                          , o = t;
                        ("AreaPrivativa" === a || "AreaTotal" === a) && (o = (o = t.replace(/[^\d]/g, "")).slice(0, 4)),
                        D(e => ({
                            ...e,
                            [a]: o
                        }));
                        let l = k.find(e => e.name === a);
                        l && l.isMonetary && O(e => ({
                            ...e,
                            [a]: o
                        }))
                    }
                    ,
                    validation: s
                }), m && (0,
                o.jsx)("div", {
                    className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4",
                    role: "alert",
                    children: (0,
                    o.jsx)("span", {
                        className: "block sm:inline",
                        children: m
                    })
                }), g && (0,
                o.jsx)("div", {
                    className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4",
                    role: "alert",
                    children: (0,
                    o.jsx)("span", {
                        className: "block sm:inline",
                        children: g
                    })
                }), (0,
                o.jsxs)("div", {
                    className: "w-full flex justify-between mt-6",
                    children: [(0,
                    o.jsxs)("span", {
                        className: "text-xs text-gray-500",
                        children: ["Esse formul\xe1rio cria uma nova ", (0,
                        o.jsx)("strong", {
                            children: "pagina de im\xf3vel"
                        }), " copiando os dados do condom\xednio original. ", (0,
                        o.jsx)("br", {}), "Ser\xe1 gerado um novo c\xf3digo e slug, al\xe9m das informa\xe7\xf5es preenchidas acima."]
                    }), (0,
                    o.jsx)("button", {
                        type: "button",
                        onClick: P,
                        disabled: n,
                        className: "bg-black hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out",
                        children: n ? "Cadastrando..." : "Cadastrar Im\xf3vel"
                    })]
                })]
            })
        }
        );
        function ea() {
            let[e,a] = (0,
            l.useState)(!1)
              , [t,s] = (0,
            l.useState)(!1)
              , [n,m] = (0,
            l.useState)(!1)
              , [g,p] = (0,
            l.useState)(!1)
              , [x,v] = (0,
            l.useState)(!1)
              , h = (0,
            r.useRouter)()
              , f = (0,
            N.Z)(e => e.imovelSelecionado)
              , y = (0,
            N.Z)(e => e.mode)
              , j = (0,
            N.Z)(e => e.limparImovelSelecionado)
              , E = (null == f ? void 0 : f.Automacao) === !0
              , {formData: A, setFormData: V, displayValues: O, setDisplayValues: k, handleChange: T, newImovelCode: U, fileInputRef: R, showImageModal: B, setShowImageModal: q, addImage: J, addSingleImage: K, updateImage: Q, removeImage: H, removeAllImages: Y, setImageAsHighlight: X, changeImagePosition: ea, validation: et, handleImagesUploaded: eo} = M()
              , {handleSubmit: el, isSaving: er, error: ei, success: es, setError: en, setSuccess: ed} = _(A, a, y, null == f ? void 0 : f._id)
              , {handleFileUpload: ec} = Z(Q, ed, en)
              , em = async () => {
                if (!A.Foto || 0 === A.Foto.length) {
                    en("N\xe3o h\xe1 fotos para baixar");
                    return
                }
                v(!0),
                en("");
                try {
                    let e = A.Foto.map( (e, a) => new Promise(t => {
                        let o = document.createElement("a");
                        o.href = e.Foto,
                        o.download = "imovel-".concat(A.Codigo || "novo", "-").concat(a + 1, ".jpg"),
                        document.body.appendChild(o),
                        o.click(),
                        document.body.removeChild(o),
                        t()
                    }
                    ));
                    await Promise.all(e),
                    ed("Download de ".concat(A.Foto.length, " fotos conclu\xeddo"))
                } catch (e) {
                    console.error("Erro ao baixar fotos:", e),
                    en("Erro durante o download das fotos")
                } finally {
                    v(!1)
                }
            }
            ;
            (0,
            l.useEffect)( () => {
                f && "edit" === y && (V({
                    ...f,
                    Foto: f.Foto ? Array.isArray(f.Foto) ? f.Foto.map( (e, a) => ({
                        ...e,
                        Codigo: "photo-".concat(Date.now(), "-").concat(a),
                        Destaque: e.Destaque || "Nao",
                        Ordem: e.Ordem || a + 1
                    })) : "object" == typeof f.Foto ? Object.keys(f.Foto).map( (e, a) => ({
                        ...f.Foto[e],
                        Codigo: e,
                        Destaque: f.Foto[e].Destaque || "Nao",
                        Ordem: f.Foto[e].Ordem || a + 1
                    })) : [] : [],
                    Video: ( () => {
                        if (!f.Video)
                            return {};
                        let e = {};
                        return Array.isArray(f.Video) && f.Video.forEach(a => {
                            a.Codigo && (e[a.Codigo] = {
                                ...a
                            })
                        }
                        ),
                        e
                    }
                    )(),
                    Slug: (0,
                    G.K)(f.Empreendimento || "")
                }),
                k(( () => {
                    let e = {};
                    return ["ValorAntigo", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].forEach(a => {
                        if (f[a]) {
                            let t = "string" == typeof f[a] ? f[a].replace(/\D/g, "") : f[a];
                            e[a] = W(t)
                        }
                    }
                    ),
                    e
                }
                )()))
            }
            , [f, y, V, k]),
            (0,
            l.useEffect)( () => () => {}
            , []);
            let eu = async () => {
                if (!A.Codigo) {
                    en("N\xe3o \xe9 poss\xedvel desativar um im\xf3vel sem c\xf3digo.");
                    return
                }
                if (window.confirm("Tem certeza que deseja desativar este im\xf3vel? Ele ser\xe1 movido para a lista de im\xf3veis inativos.")) {
                    p(!0),
                    en(""),
                    ed("");
                    try {
                        let e = await (0,
                        z.Zi)(A.Codigo);
                        e && e.success ? (ed("Im\xf3vel desativado com sucesso!"),
                        setTimeout( () => {
                            h.push("/admin/imoveis")
                        }
                        , 2e3)) : en((null == e ? void 0 : e.message) || "Erro ao desativar im\xf3vel")
                    } catch (e) {
                        console.error("Erro ao desativar im\xf3vel:", e),
                        en("Ocorreu um erro ao desativar o im\xf3vel")
                    } finally {
                        p(!1)
                    }
                }
            }
            ;
            return (0,
            o.jsxs)(i.default, {
                children: [B && (0,
                o.jsx)(d, {
                    title: "Upload de Imagens",
                    onClose: () => q(!1),
                    onUploadComplete: eo
                }), e && (0,
                o.jsx)(c.Z, {
                    title: E || "create" === y ? "Im\xf3vel cadastrado com sucesso" : "edit" === y ? "Im\xf3vel ".concat(null == A ? void 0 : A.Empreendimento, " atualizado com sucesso") : "",
                    description: E || "create" === y ? "O im\xf3vel ".concat(null == A ? void 0 : A.Empreendimento, " foi cadastrado com sucesso com o c\xf3digo ").concat(U, ".") : "edit" === y ? "O im\xf3vel ".concat(null == A ? void 0 : A.Empreendimento, " com C\xf3digo ").concat(null == A ? void 0 : A.Codigo, " foi atualizado com sucesso.") : "",
                    buttonText: "Ver no site",
                    link: "/imovel-".concat(A.Codigo || U, "/").concat(null == A ? void 0 : A.Slug)
                }), (0,
                o.jsxs)("div", {
                    className: "",
                    children: [(0,
                    o.jsx)(u, {
                        title: "edit" === y && A.Empreendimento ? "Editar Im\xf3vel: ".concat(A.Empreendimento) : "Cadastrar Novo Im\xf3vel",
                        error: ei,
                        success: es,
                        isAutomacao: E
                    }), (0,
                    o.jsxs)("div", {
                        className: "flex justify-between gap-2 py-4",
                        children: ["Sim" === A.Ativo && (0,
                        o.jsx)("button", {
                            onClick: eu,
                            disabled: g || "edit" !== y,
                            className: "border-2 bg-red-100 font-bold px-4 py-2 rounded-md min-w-[180px] ".concat(g ? "bg-red-300 text-red-500 cursor-not-allowed" : "edit" !== y ? "bg-red-100 text-red-400 cursor-not-allowed border-red-200" : "text-red-700 hover:text-red-900 hover:border-red-400"),
                            children: g ? "Desativando..." : "Desativar Im\xf3vel"
                        }), (0,
                        o.jsxs)("div", {
                            className: "w-full flex justify-end gap-2",
                            children: [(0,
                            o.jsx)("button", {
                                onClick: () => {
                                    s(!t),
                                    !t && n && m(!1)
                                }
                                ,
                                className: "font-bold px-4 py-2 rounded-md ".concat(t ? "bg-[#8B6F48] text-white hover:bg-[#8B6F48]/40" : "bg-gray-200 text-gray-500 hover:bg-gray-300"),
                                children: "Propriet\xe1rios"
                            }), "edit" === y && (0,
                            o.jsx)("button", {
                                onClick: () => {
                                    m(!n),
                                    !n && t && s(!1)
                                }
                                ,
                                className: "font-bold px-4 py-2 rounded-md ".concat(n ? "bg-[#8B6F48] text-white hover:bg-[#8B6F48]/40" : "bg-gray-200 text-gray-500 hover:bg-gray-300"),
                                children: "Duplicar Im\xf3vel"
                            })]
                        })]
                    }), (0,
                    o.jsxs)("form", {
                        onSubmit: el,
                        className: "space-y-8",
                        children: [t && (0,
                        o.jsx)($, {
                            id: A.Codigo
                        }, "proprietarios-section"), n && (0,
                        o.jsx)(ee, {
                            formData: A,
                            displayValues: O,
                            onChange: T,
                            validation: et
                        }, "vincular-section"), (0,
                        o.jsx)(C, {
                            formData: {
                                ...A,
                                Ativo: A.Ativo || "Sim"
                            },
                            displayValues: O,
                            onChange: T,
                            validation: et
                        }, "basic-info-section"), (0,
                        o.jsx)(S, {
                            formData: A,
                            displayValues: O,
                            onChange: T,
                            validation: et
                        }, "location-section"), (0,
                        o.jsx)(w, {
                            formData: A,
                            displayValues: O,
                            onChange: T
                        }, "features-section"), (0,
                        o.jsx)(D, {
                            formData: A,
                            displayValues: O,
                            onChange: T
                        }, "values-section"), (0,
                        o.jsx)(I, {
                            formData: A,
                            displayValues: O,
                            onChange: T
                        }, "broker-section"), (0,
                        o.jsx)(P, {
                            formData: A,
                            displayValues: O,
                            onChange: T
                        }, "description-section"), (0,
                        o.jsx)(F, {
                            formData: A,
                            displayValues: O,
                            onChange: T
                        }, "media-section"), (0,
                        o.jsx)(L, {
                            formData: A,
                            addSingleImage: K,
                            showImageModal: J,
                            updateImage: Q,
                            removeImage: H,
                            removeAllImages: Y,
                            downloadAllPhotos: em,
                            downloadingPhotos: x,
                            setImageAsHighlight: X,
                            changeImagePosition: ea,
                            validation: et
                        }, "images-section"), ei && (0,
                        o.jsxs)("div", {
                            className: "bg-red-100 p-4 text-red-500 rounded-lg",
                            children: [ei, ": verifique se esse im\xf3vel j\xe1 esta cadastrado anteriormente."]
                        }), (0,
                        o.jsx)(b, {
                            isSaving: er,
                            isValid: et.isFormValid,
                            isEditMode: "edit" === y,
                            onCancel: () => {
                                let e = f && !1 === f.Automacao ? "/admin/imoveis" : "/admin/automacao";
                                j(),
                                h.push(e)
                            }
                        }, "form-footer")]
                    }), (0,
                    o.jsx)("input", {
                        ref: R,
                        type: "file",
                        accept: "image/*",
                        onChange: e => {
                            let a = e.target.files;
                            a.length > 0 && (ec(R.current.getAttribute("data-codigo"), a[0]),
                            e.target.value = "")
                        }
                        ,
                        style: {
                            display: "none"
                        }
                    })]
                })]
            })
        }
    },
    57762: function(e, a, t) {
        "use strict";
        t.d(a, {
            J: function() {
                return r
            },
            y: function() {
                return l
            }
        });
        var o = t(71693);
        async function l(e) {
            try {
                return (await o.Z.post("/admin/logs", e)).data
            } catch (e) {
                throw console.error("Erro ao salvar log:", e),
                e
            }
        }
        async function r() {
            try {
                return (await o.Z.get("/admin/logs")).data
            } catch (e) {
                throw console.error("Erro ao buscar logs:", e),
                e
            }
        }
    },
    34785: function(e, a, t) {
        "use strict";
        var o = t(10903)
          , l = t(89291);
        let r = (0,
        o.U)((0,
        l.tJ)( (e, a) => ({
            imovelSelecionado: null,
            mode: "create",
            historicoImoveis: [],
            setImovelSelecionado: a => {
                a && e(e => {
                    let t = [...e.historicoImoveis]
                      , o = t.findIndex(e => e.Codigo === a.Codigo);
                    return -1 !== o && t.splice(o, 1),
                    t.unshift(a),
                    {
                        imovelSelecionado: a,
                        historicoImoveis: t.slice(0, 10),
                        mode: "edit"
                    }
                }
                )
            }
            ,
            limparImovelSelecionado: () => e({
                imovelSelecionado: null,
                mode: "create",
                historicoImoveis: []
            }),
            getImovelSelecionado: () => a().imovelSelecionado,
            getMode: () => a().mode,
            setMode: a => e({
                mode: a
            }),
            limparHistorico: () => e({
                historicoImoveis: []
            })
        }), {
            name: "imovel-storage",
            partialize: e => ({
                imovelSelecionado: e.imovelSelecionado,
                mode: e.mode
            })
        }));
        a.Z = r
    },
    78285: function(e, a, t) {
        "use strict";
        function o(e) {
            let a;
            if (null == e)
                return "0";
            if ("string" == typeof e) {
                if (/^\d{1,3}(\.\d{3})+$/.test(e))
                    return e;
                let t = e.replace(/[^\d.,]/g, "");
                a = t.includes(",") && !t.includes(".") ? parseFloat(t.replace(",", ".")) : t.includes(",") && t.includes(".") ? parseFloat(t.replace(/\./g, "").replace(",", ".")) : parseFloat(t)
            } else
                a = "number" == typeof e ? e : Number(e) || 0;
            return isNaN(a) && (a = 0),
            (a = Math.floor(a)).toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }
        t.d(a, {
            T: function() {
                return o
            }
        })
    },
    79367: function(e, a, t) {
        "use strict";
        function o(e) {
            return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/[^\w-]/g, "")
        }
        t.d(a, {
            K: function() {
                return o
            }
        })
    },
    59361: function(e, a, t) {
        "use strict";
        t.d(a, {
            t: function() {
                return l
            }
        });
        var o = t(75735);
        let l = async () => {
            try {
                let e = (0,
                o.v0)().currentUser;
                if (!e)
                    throw Error("No authenticated user found");
                let a = new Date;
                return {
                    user: {
                        uid: e.uid,
                        email: e.email,
                        displayName: e.displayName
                    },
                    timestamp: a,
                    formattedDate: a.toLocaleDateString("pt-BR"),
                    formattedTime: a.toLocaleTimeString("pt-BR")
                }
            } catch (e) {
                throw console.error("Error getting current user and date:", e),
                e
            }
        }
    },
    32520: function(e, a, t) {
        "use strict";
        t.d(a, {
            p: function() {
                return d
            },
            z: function() {
                return s
            }
        });
        var o = t(35334);
        t(80713);
        var l = t(28590)
          , r = t(20357);
        new o.g({
            region: r.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: r.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: r.env.AWS_SECRET_ACCESS_KEY
            }
        });
        let i = "npi-imoveis"
          , s = async e => {
            if (!e)
                throw Error("File is required");
            let a = e.name.split(".").pop()
              , t = e.type
              , o = "imagens_baixadas/".concat((0,
            l.Z)(), ".").concat(a)
              , r = "https://".concat(i, ".s3.amazonaws.com/").concat(o);
            return {
                file: e,
                key: o,
                contentType: t,
                fileUrl: r
            }
        }
          , n = e => new Promise( (a, t) => {
            let o = new FileReader;
            o.readAsDataURL(e),
            o.onload = () => {
                a(o.result.split(",")[1])
            }
            ,
            o.onerror = e => t(e)
        }
        )
          , d = async e => {
            try {
                let a = await n(e.file)
                  , t = {
                    bucket: i,
                    key: e.key,
                    contentType: e.contentType,
                    file: a
                }
                  , o = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(t)
                });
                if (!o.ok) {
                    let e = await o.json();
                    throw Error(e.message || "Erro ao fazer upload")
                }
                return !0
            } catch (e) {
                throw console.error("Erro no upload para S3:", e),
                e
            }
        }
    }
}, function(e) {
    e.O(0, [4358, 4728, 411, 251, 231, 8173, 4462, 8472, 1628, 1898, 2355, 6823, 8160, 2971, 7023, 1744], function() {
        return e(e.s = 99451)
    }),
    _N_E = e.O()
}
]);
