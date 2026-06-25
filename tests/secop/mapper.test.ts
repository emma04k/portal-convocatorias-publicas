import { describe, expect, it } from "vitest";
import { mapSecopRecord } from "@/lib/secop/mapper";

describe("SECOP mapper", () => {
  it("normalizes Socrata records into the stable convocatoria DTO", () => {
    const mapped = mapSecopRecord({
      id_del_proceso: "CO1.REQ.2577563",
      referencia_del_proceso: "EDP-545-2022",
      nombre_del_procedimiento: "Prestación de servicios profesionales",
      descripci_n_del_procedimiento: "Descripción completa",
      entidad: "DEPARTAMENTO ADMINISTRATIVO NACIONAL DE ESTADISTICA (DANE)",
      estado_resumen: "Presentación de oferta",
      estado_del_procedimiento: "Seleccionado",
      fase: "Presentación de oferta",
      fecha_de_publicacion_del: "2022-01-18T00:00:00.000",
      precio_base: "57333333",
      modalidad_de_contratacion: "Contratación directa",
      tipo_de_contrato: "Prestación de servicios",
      departamento_entidad: "Distrito Capital de Bogotá",
      ciudad_entidad: "Bogotá",
      urlproceso: { url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.2597221" },
    });

    expect(mapped).toMatchObject({
      externalId: "CO1.REQ.2577563",
      processNumber: "EDP-545-2022",
      title: "Prestación de servicios profesionales",
      description: "Descripción completa",
      entityName: "DEPARTAMENTO ADMINISTRATIVO NACIONAL DE ESTADISTICA (DANE)",
      status: "Presentación de oferta",
      phase: "Presentación de oferta",
      publishedAt: "2022-01-18T00:00:00.000",
      basePrice: 57333333,
      contractingModality: "Contratación directa",
      contractType: "Prestación de servicios",
      department: "Distrito Capital de Bogotá",
      city: "Bogotá",
      url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.2597221",
      source: "SECOP_II",
    });
    expect(mapped.rawData.id_del_proceso).toBe("CO1.REQ.2577563");
  });
});
