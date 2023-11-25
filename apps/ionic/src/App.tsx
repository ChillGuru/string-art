import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';

import { Layout } from './components/Layout';
import { AdminPage } from './components/pages/AdminPage';
import { GeneratorPage } from './components/pages/GeneratorPage';
import { LoginPage } from './components/pages/LoginPage';
import { UploadPage } from './components/pages/UploadPage';
import { Protected } from './components/routing/Protected';
import { SwitchByRoles } from './components/routing/SwitchByRoles';
import './theme/variables.css';

setupIonicReact();

const onRoles = {
  user: () => <Redirect to='/app' />,
  admin: () => <Redirect to='/admin' />,
};

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path='/'>
            <SwitchByRoles onRoles={onRoles}>
              <Layout>
                <LoginPage />
              </Layout>
            </SwitchByRoles>
          </Route>

          <Route exact path='/app'>
            <Protected userRole='user'>
              <UploadPage />
            </Protected>
          </Route>
          <Route exact path='/app/generator'>
            <Protected userRole='user'>
              <GeneratorPage />
            </Protected>
          </Route>

          <Route exact path='/admin'>
            <Protected userRole='admin'>
              <AdminPage />
            </Protected>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
