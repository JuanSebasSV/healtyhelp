import { memo } from "react";

const IcoLogo = memo(() => (
  <img src="/logo.png" alt="Logo"/>
));
IcoLogo.displayName = "IcoLogo";

export default IcoLogo;
