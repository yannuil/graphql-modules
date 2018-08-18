import {
  injectable,
  inject,
  ModuleConfig,
  CommunicationBridge,
  AppInfo,
} from '@graphql-modules/core';

@injectable()
export class Info {
  constructor(
    @inject(ModuleConfig('info')) private config: any,
    @inject(CommunicationBridge)
    private communicationBridge: CommunicationBridge,
    @inject(AppInfo) private app: AppInfo,
  ) {}

  getVersion() {
    this.communicationBridge.publish(
      'ASKED_FOR_VERSION',
      `${this.app.getRequest().method}: ${this.app.getRequest().url}`,
    );
    return this.config.version;
  }
}