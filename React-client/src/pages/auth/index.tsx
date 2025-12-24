import { Card, CardBody, Tab, Tabs } from "@heroui/react"
import { useState } from "react"
import { Login } from "../../features/user/login"
import { Register } from "../../features/user/register"
import { useAuthGuard } from "../../hooks/useAuthGuard"

export const Auth = () => {
  const [selected, setSelected] = useState("login")

  useAuthGuard()

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col w-full max-w-md">
        <Card className="w-full">
          <CardBody className="p-6">
            <Tabs
              fullWidth
              size="lg"
              selectedKey={selected}
              onSelectionChange={(key) => setSelected(key as string)}
              className="w-full"
            >
              <Tab key="login" title="Вход">
                <div className="pt-4">
                  <Login setSelected={setSelected} />
                </div>
              </Tab>
              <Tab key="sign-up" title="Регистрация">
                <div className="pt-4">
                  <Register setSelected={setSelected} />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}