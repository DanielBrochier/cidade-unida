"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, type CategoriaId } from "@/lib/categorias";
import type { CidadePublica } from "@/lib/tenant";
import MapaSelecionarLocalClient from "@/components/MapaSelecionarLocalClient";
import { comprimirImagem } from "@/lib/comprimir-imagem";

type StatusLocalizacao = "buscando" | "ok" | "negado" | "indisponivel";
type StatusEnvio = "idle" | "enviando" | "sucesso" | "erro";

export default function FormularioRelato({ cidade }: { cidade: CidadePublica }) {
  const [categoria, setCategoria] = useState<CategoriaId>("estrada");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number }>({
    lat: cidade.latitude,
    lng: cidade.longitude,
  });
  const [statusLocalizacao, setStatusLocalizacao] = useState<StatusLocalizacao>("buscando");
  const [comprimindoFoto, setComprimindoFoto] = useState(false);
  const [statusEnvio, setStatusEnvio] = useState<StatusEnvio>("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const pedirLocalizacao = () => {
    if (!("geolocation" in navigator)) {
      setStatusLocalizacao("indisponivel");
      return;
    }
    setStatusLocalizacao("buscando");
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setCoordenadas({ lat: posicao.coords.latitude, lng: posicao.coords.longitude });
        setStatusLocalizacao("ok");
      },
      () => setStatusLocalizacao("negado"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // Kicks off the browser geolocation subscription on mount; the eventual
    // state update happens inside getCurrentPosition's async callbacks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pedirLocalizacao();
  }, []);

  useEffect(() => {
    if (!foto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  async function selecionarFoto(arquivo: File | null) {
    if (!arquivo) {
      setFoto(null);
      return;
    }
    setComprimindoFoto(true);
    const comprimida = await comprimirImagem(arquivo);
    setFoto(comprimida);
    setComprimindoFoto(false);
  }

  const podeEnviar =
    foto !== null && !comprimindoFoto && statusLocalizacao !== "buscando" && statusEnvio !== "enviando";

  async function enviarRelato() {
    if (!foto) return;
    setStatusEnvio("enviando");
    setMensagemErro(null);

    const formData = new FormData();
    formData.set("categoria", categoria);
    formData.set("nome", nome);
    formData.set("descricao", descricao);
    formData.set("latitude", String(coordenadas.lat));
    formData.set("longitude", String(coordenadas.lng));
    formData.set("foto", foto);

    try {
      const resposta = await fetch("/api/relatos", { method: "POST", body: formData });
      const corpo = await resposta.json();
      if (!resposta.ok) {
        setMensagemErro(corpo.erro ?? "Não foi possível enviar o relato.");
        setStatusEnvio("erro");
        return;
      }
      setStatusEnvio("sucesso");
    } catch {
      setMensagemErro("Sem conexão. Verifique a internet e tente novamente.");
      setStatusEnvio("erro");
    }
  }

  function novoRelato() {
    setCategoria("estrada");
    setNome("");
    setDescricao("");
    setFoto(null);
    setStatusEnvio("idle");
    setMensagemErro(null);
    pedirLocalizacao();
  }

  if (statusEnvio === "sucesso") {
    return (
      <div className="rounded-lg border border-line bg-paper-raised p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-moss-soft text-2xl text-moss">
          ✓
        </div>
        <h2 className="font-serif text-xl font-semibold">Relato enviado</h2>
        <p className="mt-2 text-sm text-ink-soft">
          A prefeitura de {cidade.nome} recebeu seu relato e vai priorizar o atendimento.
        </p>
        <button
          onClick={novoRelato}
          className="mt-5 rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
        >
          Enviar outro relato
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviarRelato();
      }}
      className="flex flex-col gap-5 rounded-lg border border-line bg-paper-raised p-5"
    >
      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Foto do problema
        </span>
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => selecionarFoto(e.target.files?.[0] ?? null)}
        />
        {comprimindoFoto ? (
          <div className="flex h-28 w-full items-center justify-center rounded-md border border-dashed border-line text-sm text-ink-soft">
            Preparando foto…
          </div>
        ) : fotoPreview ? (
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            aria-label="Trocar foto"
            className="block w-full overflow-hidden rounded-md border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreview}
              alt="Prévia da foto do problema"
              width={640}
              height={176}
              className="h-44 w-full object-cover"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            className="flex h-28 w-full items-center justify-center rounded-md border border-dashed border-line text-sm text-ink-soft hover:border-accent hover:text-accent"
          >
            Toque para fotografar
          </button>
        )}
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Tipo de problema
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                categoria === c.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-soft hover:border-ink-soft"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-soft">
          Localização
        </span>
        <div className="mb-2 font-mono text-xs text-ink-soft" aria-live="polite">
          {statusLocalizacao === "buscando" && <span>◎ localizando…</span>}
          {statusLocalizacao === "ok" && (
            <span className="text-moss">◎ localização capturada — arraste o mapa se precisar ajustar</span>
          )}
          {statusLocalizacao === "negado" && (
            <span className="text-accent">
              ◎ localização negada — arraste o mapa até o pino marcar o local certo, ou{" "}
              <button type="button" onClick={pedirLocalizacao} className="underline">
                tentar de novo
              </button>
            </span>
          )}
          {statusLocalizacao === "indisponivel" && (
            <span className="text-accent">◎ arraste o mapa pra marcar o local</span>
          )}
        </div>
        <div className="h-44 overflow-hidden rounded-md border border-line">
          {statusLocalizacao === "buscando" ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              localizando…
            </div>
          ) : (
            <MapaSelecionarLocalClient posicao={coordenadas} aoMover={setCoordenadas} />
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Seu nome <em className="font-normal normal-case text-ink-soft/80">(opcional)</em>
        </span>
        <input
          name="nome"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Se quiser, diga quem está relatando"
          maxLength={120}
          className="rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Descrição <em className="font-normal normal-case text-ink-soft/80">(opcional)</em>
        </span>
        <textarea
          name="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Algum detalhe que ajude a localizar ou entender o problema"
          maxLength={1000}
          rows={3}
          className="resize-none rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </label>

      {mensagemErro && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent" aria-live="polite">
          {mensagemErro}
        </p>
      )}

      <p className="text-xs text-ink-soft">
        Sua foto e localização serão enviadas para a prefeitura de {cidade.nome} e ficam
        visíveis só pra equipe responsável pelo atendimento.
      </p>

      <button
        type="submit"
        disabled={!podeEnviar}
        className="rounded-md bg-accent py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {statusEnvio === "enviando" ? "Enviando…" : "Enviar relato"}
      </button>
    </form>
  );
}
