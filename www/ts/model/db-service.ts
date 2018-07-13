import {IHttpService, IQService} from 'angular';
import {LSKEYS, LsService} from './ls-service';

export class DbService {
  private auth = 'gTf2SKTXTQY24DnT8bV0eVaaoYyfOc6455oLtyWC';
  private baseUrl = 'https://exited-f73b2.firebaseio.com/';
  private dbVersion = this.LsService.get(this.LSKEYS.dbVersion) || 0;
  private favsVersion = this.LsService.get(this.LSKEYS.favsVersion) || 0;

  constructor(
    private $http: IHttpService,
    private $q: IQService,
    private LsService: LsService,
    private LSKEYS: LSKEYS
  ){

  }

  private getUrl(path, params?){
    let url = this.baseUrl + path + '.json?auth=' + this.auth;
    if(params){
      url += params;
    }
    return url;
  }

  private getVersion(){
    return this.$http.get(this.getUrl('version')).then(
      (response) => {
        return this.$q.resolve(response.data);
      },
      (error) => {
        return this.$q.reject(error);
      }
    );
  }

  private getData(){
    return this.$http.get(this.getUrl('data')).then(
      (response) => {
        let data = response.data;
        // LsService.set(LSKEYS.data, data);

        return this.$q.resolve(data);
      },
      (error) => {
        return this.$q.reject(error);
      }
    );
  }

  getLatestData(){
    return this.getVersion().then(
      (version: any) => {
        //TODO
        //if(version.favs > favsVersion){
        //
        //}
        if(version.db > this.dbVersion){
          this.dbVersion = version.db;
          this.LsService.set(this.LSKEYS.dbVersion, this.dbVersion);

          return this.getData();
        }else{
          return this.$q.resolve(false);
        }
      },
      (error) => {
        return this.$q.reject(error);
      }
    );
  }
}
