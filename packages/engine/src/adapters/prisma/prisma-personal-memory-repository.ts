import type { PersonalContextSnapshot, PersonalMemory } from "@nani/contracts";
import type {
  MemoryCertainty,
  MemoryKind,
  MemoryScope,
  MemorySensitivity,
  MemoryStatus,
  PrismaClient
} from "../../generated/prisma/client.js";
import { EngineError } from "../../errors/engine-error.js";
import type { PersonalMemoryPort } from "../../ports/personal-memory-port.js";

const lower = <T extends string>(value: T): Lowercase<T> => value.toLowerCase() as Lowercase<T>;

export class PrismaPersonalMemoryRepository implements PersonalMemoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async loadBootstrap(userId: string): Promise<PersonalContextSnapshot> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        memories: {
          where: {
            deletedAt: null,
            currentRevision: { status: "ACTIVE" }
          },
          include: {
            currentRevision: { include: { evidence: true } }
          },
          orderBy: [{ kind: "asc" }, { topicKey: "asc" }]
        }
      }
    });

    if (!profile) {
      throw new EngineError(
        "profile_not_found",
        "No existe un perfil personal para el usuario configurado. Crealo mediante el flujo de administración autorizado."
      );
    }

    const loadedAt = new Date().toISOString();
    const memories = profile.memories.flatMap((memory): PersonalMemory[] => {
      const revision = memory.currentRevision;
      if (!revision) return [];

      return [{
        id: memory.id,
        kind: lower(revisionKind(memory.kind)),
        topicKey: memory.topicKey,
        scope: lower(revisionScope(memory.scope)),
        scopeRef: memory.scopeRef,
        subject: memory.subject,
        content: revision.content,
        certainty: lower(revisionCertainty(revision.certainty)),
        status: lower(revisionStatus(revision.status)),
        revision: revision.revision,
        validFrom: revision.validFrom.toISOString(),
        sourceRefs: revision.evidence.map((item) => item.sourceRef),
        sensitivity: lower(revisionSensitivity(revision.sensitivity)),
        exposure: revision.exposure
      }];
    });

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      language: profile.language,
      timezone: profile.timezone,
      summary: profile.currentSummary,
      contextRevision: profile.contextRevision,
      memories,
      loadedAt,
      sources: [{
        source: "supabase",
        status: "loaded",
        revision: String(profile.contextRevision),
        loadedAt,
        detail: `${memories.length} memorias personales vigentes`
      }]
    };
  }
}

function revisionKind(value: MemoryKind): MemoryKind { return value; }
function revisionScope(value: MemoryScope): MemoryScope { return value; }
function revisionCertainty(value: MemoryCertainty): MemoryCertainty { return value; }
function revisionStatus(value: MemoryStatus): MemoryStatus { return value; }
function revisionSensitivity(value: MemorySensitivity): MemorySensitivity { return value; }
