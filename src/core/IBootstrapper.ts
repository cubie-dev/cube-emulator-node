export interface IBootstrapper {
    onEmulatorBootstrapping?: () => Promise<void>;
    onEmulatorStart?: () => Promise<void>;
    onEmulatorStop?: () => Promise<void>;
}
